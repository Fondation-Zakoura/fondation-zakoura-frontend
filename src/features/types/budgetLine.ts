import type { BudgetCategory } from "./budgetCategory";
import type { Partner } from "./partners";
import type { Project } from "./project";

export interface BudgetLine {
    id:number;
    code:number;
    total_amount:number;
    consumed_amount:number;
    remaining_amount:number;
    status:string;
    budget_category_id:number;
    category:BudgetCategory;
    project_id:number;
    project:Project;
    partners:Partner[];
    created_at:string;
    updated_at:string;
}