export interface BudgetCategory{
    code : string;
    label : string;
    type: string;
    budgetary_area: string[]; 
    is_active:boolean;
    created_at:string;
    deleted_at:string;
    updated_at:string;
}