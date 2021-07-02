import { LightningElement,track } from 'lwc';
import getData from '@salesforce/apex/GetDataFromOrg.getData';
import deleteRecords from '@salesforce/apex/GetDataFromOrg.deleteRecords';
import getAllCustomSObjects from '@salesforce/apex/GetDataFromOrg.getAllCustomSObjects';
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord } from 'lightning/uiRecordApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
var forEachTemp=0;
export default class DynamicView extends NavigationMixin(LightningElement) {
    condition=true;
    newButton='New Account';
    objectType='Account';
    columns=[];
    data;
    isModalOpen=false;
    options=[];
    values=[];
    selectedFields=[];
    defaultValues=[];
    selectedRows=[];
    nOfRecordDisplay='5';
    recordsToDisplay=[];
    allObjects=[];
    isMore=false;
    newObject={label:'Account',value:'Account'};
    totalPages=1;
    currentPage=1;
    disabledLeft=true;
    disabledRight=false;
    currentShowingPages=[];
    variant='brand';
    edit=false;
    id;
    fields=[];
    newRecord=false;
    draftValues=[];
    comboOptions=[{ label: '5', value: '5' },
                { label: '10', value: '10' },
                { label: '15', value: '15' },
            ];
    tabs=[{name:'Account',value:'Account'},
        {name:'Contact',value:'Contact'},
        {name:'Lead',value:'Lead'},
        {name:'Opportunity',value:'Opportunity'},
        {name:'More',value:'More'},];
    
    actions = [
        { label: 'Veiw', name: 'view'}, 
        { label: 'Edit', name: 'edit'}, 
        { label: 'Delete', name: 'delete'}
    ];
    
    connectedCallback()
    {
        this.getData();
        this.getAllCustomSObjects();
    }
    getAllCustomSObjects()
    {
        getAllCustomSObjects()
        .then(result=>{
            for(var i=0;i<result.name.length;i++)
            {
                this.allObjects.push({label:result.label[i],value:result.name[i]});
            }
        })
        .catch(error=>{
            console.log(error);
        });
        
    }
    getData(){
        getData({objectType:this.objectType})
        .then(result=>{
            this.options=[];
            this.fields=[];
            for(var i=0;i<result.fields.length;i++)
            {
                this.fields.push(result.fields[i]);
                this.options.push({label: result.fields[i],value: result.fields[i]});
            }
            this.columns = [
                    {label: result.fields[0], fieldName: result.fields[0],editable: true},
                    {label: result.fields[1], fieldName: result.fields[1],editable: true},
                    {label: result.fields[2], fieldName: result.fields[2],editable: true},
                    {label: result.fields[3], fieldName: result.fields[3],editable: true},
                    {label: result.fields[4], fieldName: result.fields[4],editable: true},
                    {
                        type: 'action',
                        typeAttributes: {
                            rowActions: this.actions,
                            menuAlignment: 'right'
                        }
                    }
            ];
            this.values=[result.fields[0],result.fields[1],result.fields[2],result.fields[3],result.fields[4]];
            this.data=result.records;
            this.recordsToDisplay=this.data.slice(0,parseInt(this.nOfRecordDisplay));
            this.currentPage=1;
            this.condition=true;
            forEachTemp=0;
            this.totalPages=Math.ceil(this.data.length/this.nOfRecordDisplay);
            this.currentShowingPages=[];
            this.disabledLeft=true;
            for(var i=0;i<this.totalPages;i++)
            {
                if(i<3)
                    this.currentShowingPages.push(i+1);
            }
            if(this.currentShowingPages[this.currentShowingPages.length-1]==this.totalPages)
            {
                this.disabledRight=true;
            }
            else
                this.disabledRight=false;
        })
        .catch(error=>{
            console.log(error);
        });
    }
    handleActive(event) {
        if(event.target.value=='More')
        {
            this.isMore=true;
        }
        else{
            this.newButton='New '+event.target.label;
            this.objectType=event.target.value;
            this.getData();
        }
        
    }
    navigateToNewRecord() {
        this.newRecord=true;
    }
    handleRowAction( event ) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            //in case of  view
            case 'view':
                this[NavigationMixin.GenerateUrl]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view',
                    },
                }).then(url => {
                     window.open(url);
                });
                break;

                //in case of edit
            case 'edit':
                this.id=row.Id;
                this.edit=true;
                break;

            case 'delete':
                var a=[row];
                deleteRecords({ records: [row]})
                .then(result => {
                    this.handleShowToastEvent('Delete Success!!','Record Deleted','success');
                    this.getData();
                })
                .catch(error=>{
                    this.handleShowToastEvent('Error!!','Error while deleting record','Error');
                });
                break;
            default:
        }
    }
    handleChange(event)
    {
        // Get the list of the "value" attribute on all the selected options
        this.selectedFields=[];
        var selectedOptions = event.detail.value;
        this.defaultValues=selectedOptions;
        for(var i  = 0; i<selectedOptions.length ; i++)
        {
            this.selectedFields.push({ label:selectedOptions[i], fieldName: selectedOptions[i]});       
        } 
        this.selectedFields.push({
            type: 'action',
            typeAttributes: {
                rowActions: this.actions,
                menuAlignment: 'right'
            }
        });
    }
    handleModal()
    {
        this.isModalOpen=true;   
    }
    closeModal()
    {
        this.edit=false;
        this.isModalOpen=false;
        this.isMore=false;
        this.newRecord=false;
    }
    saveModal()
    {
        this.columns=this.selectedFields;
        this.values=this.defaultValues;
        this.isModalOpen=false;
    }
    handleSelect(event)
    {
        this.selectedRows=event.detail.selectedRows;
    }
    onDeleteSelected()
    {
        deleteRecords({ records: this.selectedRows})
        .then(result => {
            this.handleShowToastEvent('Delete Success!!','Records Deleted','success');
            this.getData();

        })
        .catch(error=>{
            this.handleShowToastEvent('Error!!','Error while deleting records','Error');
        });
    }
    handleComboChange(event)
    {
        this.nOfRecordDisplay=event.detail.value;
        this.recordsToDisplay=this.data.slice(0,parseInt(this.nOfRecordDisplay));
        this.totalPages=Math.ceil(this.data.length/this.nOfRecordDisplay);
        this.currentPage=1;
        this.condition=true;
        forEachTemp=0;
        this.currentShowingPages=[];
        this.disabledLeft=true;
        for(var i=0;i<this.totalPages;i++)
        {
            if(i<3)
                this.currentShowingPages.push(i+1);
        }
        if(this.currentShowingPages[this.currentShowingPages.length-1]==this.totalPages)
            {
                this.disabledRight=true;
            }
            else
                this.disabledRight=false;
    }
    handleObjectChange(event)
    {
        this.newObject.label= event.target.options.find(opt => opt.value === event.detail.value).label;
        this.newObject.value=event.target.value;
    }
    saveObjectModal()
    {
        this.isMore=false;
        var temp=[];
        for(var i=0;i<this.tabs.length-1;i++)
        {
            temp.push(this.tabs[i]);
        }
        temp.push({name: this.newObject.label,value:this.newObject.value});
        temp.push({name: 'More',value:'More'});
        this.tabs=temp;
    }
    handleShowToastEvent(title,message,variant)
    {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
            }),
        );
    }
    handlePage(event)
    {
        this.currentPage=event.target.label;       
        if(this.currentPage==this.totalPages)
        {
            this.recordsToDisplay=this.data.slice((parseInt(this.currentPage)-1)*parseInt(this.nOfRecordDisplay),parseInt(this.data.length));
        }
        else
        {
            this.recordsToDisplay=this.data.slice((parseInt(this.currentPage)-1)*parseInt(this.nOfRecordDisplay),parseInt(this.currentPage)*parseInt(this.nOfRecordDisplay));
        }
    }

    handleRight()
    {
        forEachTemp=0;
        var i=this.currentShowingPages[0];
        this.currentShowingPages=[];
        for(var j=i+1;j<=i+3;j++)
        {
            this.currentShowingPages.push(j);
        }
        if(this.currentShowingPages[this.currentShowingPages.length-1]==this.totalPages)
        {
            this.disabledRight=true;
        }
        this.disabledLeft=false;
    }
    handleLeft()
    {
        forEachTemp=0;
        var i=this.currentShowingPages[0];
        this.currentShowingPages=[];
        for(var j=i-1;j<=i+1;j++)
        {
            this.currentShowingPages.push(j);
        }
        if(this.currentShowingPages[0]==1)
        {
            this.disabledLeft=true;
        }
        this.disabledRight=false;
    }
    
    get checkMethod()
    {
        if(forEachTemp==this.currentShowingPages.length)
            forEachTemp=0;
            
        if(this.currentPage==this.currentShowingPages[forEachTemp])
        {
            forEachTemp++; 
            this.condition=false;
            return true;
        }
        else
        {  
            this.condition=true;
            forEachTemp++;
            return false;
        }
    }
    handleSubmit(event) 
    {    
        this.edit = false;
        // showing success message
        this.handleShowToastEvent('Update Success!!','Record Updated','success');   
    }
    handleSuccess()
    {
        this.getData();
    }
    handleSuccessNewRecord(event)
    {
        this.newRecord=false;
        this.handleShowToastEvent('Created!!','Record Created','success');
        this.getData();
    }
    handleSave(event) 
    {
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        
        const promises = recordInputs.map(recordInput => {
            updateRecord(recordInput);
        });
    
        
        Promise.all(promises).then(() => {
            this.handleShowToastEvent('Success!!','Record Updated','success');
            this.getData();
            this.draftValues = [];
        }).catch(error => {
            this.handleShowToastEvent('Failed!!','Record cannot Updated','error');
        });
    }
}