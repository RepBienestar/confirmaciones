// generic-table.model.ts
export interface TableColumn {
    header: string;
    property: string;
    sortable?: boolean;
    filterable?: boolean;
    isStatus?: boolean;
    isAction?: boolean;
    width?: string;
    pipeType?: string;
    pipe?: string;
    alignment?: 'left' | 'center' | 'right';
}

export interface TableAction {
    icon: string;
    tooltip: string;
    action: string;
    color?: string;
    showFn?: (item: any) => boolean;
}

export interface TableConfig {
    showCheckbox?: boolean;
    checkboxFilterFn?: (item: any) => boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPagination?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
}

export interface BadgeConfig {
    text: string;
    class: string;
    icon: string;
}

export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent {
    property: string;
    direction: SortDirection;
}