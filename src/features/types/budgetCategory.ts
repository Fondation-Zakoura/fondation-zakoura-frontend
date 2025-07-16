export interface BudgetCategory{
    code : string;
    label : string;
    type: string;
    budgetary_area: string[]; 
    is_active:boolean;
}