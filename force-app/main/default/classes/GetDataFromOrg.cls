global with sharing class GetDataFromOrg {

    public class WrapperClass
    {
        @AuraEnabled
        public List<String> fields;
        @AuraEnabled
        public List<SObject> records;
    }
    public class WrapperClassObjects
    {
        @AuraEnabled
        public List<String> name;
        @AuraEnabled
        public List<String> label;
    }
    @AuraEnabled
    public static void deleteRecords(List<sObject> records)
    {
        delete records;
    }
    @AuraEnabled
    public static WrapperClassObjects getAllCustomSObjects()
    {
        List<String> name=new List<String>();
        List<String> label=new List<String>();
        for ( Schema.SObjectType o : Schema.getGlobalDescribe().values() )
        {
            name.add(o.getDescribe().getName());
            label.add(o.getDescribe().getLabel());
        }
        WrapperClassObjects wrapper=new WrapperClassObjects();
        wrapper.name=name;
        wrapper.label=label;
        return wrapper;
    }
    @AuraEnabled
    public static WrapperClass getData(String objectType)
    {
        
        SObjectType sObjType = ((SObject) Type.forName(objectType).newInstance()).getSObjectType();
        DescribeSObjectResult describeResult = sObjType.getDescribe();
        List<String> fieldNames = new List<String>( describeResult.fields.getMap().keySet() );   
        String query =' SELECT '+String.join( fieldNames, ',' ) +' FROM ' +describeResult.getName();
        List<SObject> records = Database.query( query );

        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(objectType).getDescribe().fields.getMap();
        List<String> editableFields = new List<String>();
        for(schema.SObjectField editfieds :fields.values())
        {
            schema.DescribeFieldResult fieldResult = editfieds.getDescribe();
            if(fieldResult.isUpdateable())
            {    
                editableFields.add(fieldResult.getName());   
            }
        }   
        WrapperClass wrapper=new WrapperClass();
        wrapper.records=records;
        wrapper.fields=editableFields;
        return wrapper;
    }
}