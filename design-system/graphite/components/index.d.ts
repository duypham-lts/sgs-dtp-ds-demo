import type * as React from 'react';
export type IconName = 'checkmark--filled'|'time--filled'|'warning--alt--filled'|'warning--filled'|'misuse'|'circle-dash'|'information--filled'|'search'|'chevron--down'|'close'|'arrow--right'|'add'|'view'|'view--off'|'overflow-menu--vertical'|'earth'|'checkmark'|'arrow--up'|'arrow--down'|'arrows--vertical'|'chevron--left'|'chevron--right'|'calendar'|'upload'|'document'|'information'|'folder'|'events'|'box'|'delivery'|'notification'|'user--avatar'|'edit'|'launch'|'trash-can'|'download'|'save'|'arrow--left'|'send'|'document--pdf'|'dashboard'|'category'|'folders'|'document--multiple-01'|'task'|'education'|'catalog'|'settings'|'user--multiple'|'user--access'|'side-panel--close'|'side-panel--open';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary'|'secondary'|'tertiary'|'ghost'|'danger'; size?: 'lg'|'md'|'sm'; icon?: IconName; iconPosition?: 'left'|'right'; fullWidth?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; tooltip?: boolean; tooltipPlacement?: 'top'|'bottom'; variant?: 'ghost'|'primary'|'secondary'|'tertiary'|'danger'; size?: 'lg'|'md'|'sm' }
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { inline?: boolean; weight?: 'regular'|'semibold' }
export declare function Link(props: LinkProps): React.ReactElement;
export type FieldSize = 's'|'m'|'l'|'xl'|'full';
export interface FieldProps { id?: string; label?: React.ReactNode; required?: boolean; helpText?: React.ReactNode; error?: React.ReactNode; size?: FieldSize; width?: number|string; disabled?: boolean; hideLabel?: boolean; className?: string }
export interface FormFieldProps extends FieldProps { kind?: 'text'|'select'|'icon'|'area'; trailing?: React.ReactNode; children: React.ReactNode }
export declare function FormField(props: FormFieldProps): React.ReactElement;
export interface TextInputProps extends FieldProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { trailing?: React.ReactNode }
export declare function TextInput(props: TextInputProps): React.ReactElement;
export interface TextareaProps extends FieldProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export declare function Textarea(props: TextareaProps): React.ReactElement;
export interface SearchInputProps extends TextInputProps { showLabel?: boolean }
export declare function SearchInput(props: SearchInputProps): React.ReactElement;
export interface SelectProps extends FieldProps { options: { value: string; label: string; description?: string }[]; placeholder?: string; value?: string; defaultValue?: string; onChange?: (event: { target: { value: string } }, value: string) => void; defaultOpen?: boolean }
export declare function Select(props: SelectProps): React.ReactElement;
export interface ChoiceProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: React.ReactNode; indeterminate?: boolean }
export declare function Checkbox(props: ChoiceProps): React.ReactElement;
export declare function Radio(props: ChoiceProps): React.ReactElement;
export declare function Toggle(props: ChoiceProps): React.ReactElement;
export interface TagProps { tone?: 'neutral'|'required'|'info'; children?: React.ReactNode; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;
export interface StatusTagProps { status: 'completed'|'under-review'|'needs-description'|'missing-info'|'rejected'|'draft'|'info'; label?: string; size?: 'md'|'sm'; compact?: boolean; showIcon?: boolean; className?: string }
export declare function StatusTag(props: StatusTagProps): React.ReactElement;
export interface TooltipProps { label: React.ReactNode; placement?: 'top'|'bottom'; open?: boolean; children: React.ReactElement }
export declare function Tooltip(props: TooltipProps): React.ReactElement;
export interface SnackbarProps { message: React.ReactNode; action?: { label: string; onClick?: () => void }; open?: boolean; onClose?: () => void; duration?: number; inline?: boolean; className?: string }
export declare function Snackbar(props: SnackbarProps): React.ReactElement | null;
export interface InlineNotificationProps { kind?: 'info'|'warning'|'error'|'success'; title?: React.ReactNode; children?: React.ReactNode; items?: React.ReactNode[]; action?: React.ReactNode; onClose?: () => void; live?: boolean; className?: string }
export declare function InlineNotification(props: InlineNotificationProps): React.ReactElement;
export interface ModalAction { label: string; onClick?: () => void; disabled?: boolean }
export interface ModalProps { open: boolean; title: React.ReactNode; children?: React.ReactNode; onClose?: () => void; primaryAction?: ModalAction; secondaryAction?: ModalAction; danger?: boolean; size?: 'sm'|'md'|'lg'|'fit'; dismissOnOverlay?: boolean; inline?: boolean }
export declare function Modal(props: ModalProps): React.ReactElement | null;
export interface OverflowMenuItem { label: string; onClick?: () => void; danger?: boolean; disabled?: boolean }
export interface OverflowMenuProps { items: OverflowMenuItem[]; label?: string; align?: 'end'|'start'; size?: 'lg'|'md'|'sm'; defaultOpen?: boolean; className?: string }
export declare function OverflowMenu(props: OverflowMenuProps): React.ReactElement;
export interface TabItem { id: string; label: React.ReactNode; content?: React.ReactNode; badge?: React.ReactNode; disabled?: boolean }
export interface TabsProps { tabs: TabItem[]; variant?: 'line'|'contained'; label?: string; defaultTab?: string; value?: string; onChange?: (id: string) => void; className?: string }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface BreadcrumbProps { items: { label: string; href?: string }[]; label?: string; className?: string }
export declare function Breadcrumb(props: BreadcrumbProps): React.ReactElement;
export interface AccordionItem { id: string; title: React.ReactNode; content: React.ReactNode; meta?: React.ReactNode; defaultOpen?: boolean }
export interface AccordionProps { items: AccordionItem[]; allowMultiple?: boolean; showActionLabel?: boolean; expandLabel?: string; collapseLabel?: string; className?: string }
export declare function Accordion(props: AccordionProps): React.ReactElement;
export interface Language { code: string; label: string; short: string; hint?: string }
export interface LanguageSelectorProps { languages?: Language[]; value?: string; defaultValue?: string; onChange?: (code: string) => void; compact?: boolean; align?: 'end'|'start'; defaultOpen?: boolean; className?: string }
export declare function LanguageSelector(props: LanguageSelectorProps): React.ReactElement;
export interface TableColumn<R = any> { key: string; header: React.ReactNode; align?: 'start'|'center'|'end'; width?: number|string; render?: (row: R) => React.ReactNode; sortable?: boolean; sortValue?: (row: R) => any; searchValue?: (row: R) => any; hideOnCard?: boolean }
export interface TableProps<R = any> { columns: TableColumn<R>[]; rows: R[]; density?: 'default'|'compact'|'relaxed'; caption?: string; maxHeight?: number|string; getRowId?: (row: R) => string|number; className?: string }
export declare function Table<R = any>(props: TableProps<R>): React.ReactElement;
export interface DataTableProps<R = any> extends TableProps<R> { title?: string; description?: string; searchable?: boolean; searchPlaceholder?: string; toolbarActions?: React.ReactNode; selectable?: boolean; bulkActions?: { label: string; onClick?: (rows: R[]) => void }[]; rowActions?: (row: R) => OverflowMenuItem[]; defaultSort?: { key: string; dir: 'asc'|'desc'|'none' }; pageSize?: number; pageSizeOptions?: number[]; paginate?: boolean; loading?: boolean; error?: { title?: string; message?: React.ReactNode }; emptyState?: { title?: string; body?: string; action?: React.ReactNode }; layout?: 'auto'|'table'|'cards'; cardBreakpoint?: number; cardTitleKey?: string; cardStatusKey?: string }
export declare function DataTable<R = any>(props: DataTableProps<R>): React.ReactElement;
export interface PaginationProps { totalItems: number; page: number; pageSize: number; onPageChange?: (page: number) => void; onPageSizeChange?: (size: number) => void; pageSizeOptions?: number[]; label?: string; className?: string }
export declare function Pagination(props: PaginationProps): React.ReactElement;
export interface PopoverProps { trigger: React.ReactElement; title?: React.ReactNode; label?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; align?: 'start'|'end'; width?: number|string; children?: React.ReactNode }
export declare function Popover(props: PopoverProps): React.ReactElement;
export interface PickOption { value: string; label: string; description?: string }
export interface ComboboxProps extends FieldProps { options: PickOption[]; value?: string; defaultValue?: string; onChange?: (value: string, option: PickOption) => void; placeholder?: string; emptyText?: string; defaultOpen?: boolean }
export declare function Combobox(props: ComboboxProps): React.ReactElement;
export interface MultiSelectProps extends FieldProps { options: PickOption[]; value?: string[]; defaultValue?: string[]; onChange?: (value: string[]) => void; placeholder?: string; defaultOpen?: boolean }
export declare function MultiSelect(props: MultiSelectProps): React.ReactElement;
export interface DatePickerProps extends FieldProps { value?: string; defaultValue?: string; onChange?: (iso: string) => void; min?: string; max?: string; today?: string; placeholder?: string; defaultOpen?: boolean }
export declare function DatePicker(props: DatePickerProps): React.ReactElement;
export interface UploadFile { name: string; size?: number; status: 'uploading'|'scanning'|'complete'|'error'; progress?: number; error?: string }
export interface FileUploadProps { id?: string; label?: React.ReactNode; required?: boolean; hint?: string; accept?: string; maxSizeMB?: number; multiple?: boolean; defaultFiles?: UploadFile[]; onFilesAdded?: (files: FileList) => void; onRemove?: (file: UploadFile) => void; className?: string }
export declare function FileUpload(props: FileUploadProps): React.ReactElement;
export interface ProgressBarProps { value: number; label?: string; hideLabel?: boolean; helperText?: React.ReactNode; status?: 'active'|'success'|'error'; size?: 'md'|'sm'; className?: string }
export declare function ProgressBar(props: ProgressBarProps): React.ReactElement;
export interface ReadinessRingProps { value: number; label?: string; caption?: string; size?: 'md'|'lg'; className?: string }
export declare function ReadinessRing(props: ReadinessRingProps): React.ReactElement;
export interface DrawerProps { open: boolean; title: React.ReactNode; subtitle?: React.ReactNode; onClose?: () => void; footer?: React.ReactNode; size?: 'md'|'lg'; inline?: boolean; children?: React.ReactNode }
export declare function Drawer(props: DrawerProps): React.ReactElement | null;
export interface AvatarProps { name?: string; src?: string; size?: 'sm'|'md'|'lg'; className?: string }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface NotificationBadgeProps { count?: number; max?: number; dot?: boolean; label?: string; children: React.ReactNode }
export declare function NotificationBadge(props: NotificationBadgeProps): React.ReactElement;
export interface SeparatorProps { orientation?: 'horizontal'|'vertical'; decorative?: boolean; spacing?: number|string; className?: string }
export declare function Separator(props: SeparatorProps): React.ReactElement;
export interface SkeletonProps { variant?: 'text'|'rect'|'circle'; lines?: number; width?: number|string; height?: number|string }
export declare function Skeleton(props: SkeletonProps): React.ReactElement;
export interface EmptyStateProps { title: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode; icon?: IconName; size?: 'md'|'sm'; className?: string }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;
export interface TreeItem { id: string; label: React.ReactNode; icon?: IconName; meta?: React.ReactNode; children?: TreeItem[] }
export interface TreeViewProps { items: TreeItem[]; label?: string; defaultExpanded?: string[]; selected?: string; defaultSelected?: string; onSelect?: (id: string, item: TreeItem) => void; className?: string }
export declare function TreeView(props: TreeViewProps): React.ReactElement;
export interface SectionNavItem { id: string; label: string; status?: 'complete'|'incomplete'|'error'|'optional'; icon?: IconName; href?: string }
export interface SectionNavProps { items: SectionNavItem[]; variant?: 'text'|'icon'; active?: string; defaultActive?: string; onSelect?: (id: string) => void; label?: string; className?: string }
export declare function SectionNav(props: SectionNavProps): React.ReactElement;
export interface TopBarProps { variant?: 'landing'|'login'|'home'; siteName?: string; siteSub?: string; compact?: boolean; links?: string[]; loginLabel?: string; showLanguage?: boolean; userName?: string; userEmail?: string; notifications?: number; homeLinks?: { label: string; icon?: IconName; brand?: boolean; href?: string }[]; badge?: string; tone?: 'light'|'dark'; notificationItems?: NotificationItem[]; notificationsOpen?: boolean; notificationsTab?: 'unread'|'all'; notificationsHasMore?: boolean; onNotificationOpen?: (item: NotificationItem) => void; onMarkAllRead?: () => void; onNotificationsLoadMore?: () => void; accountLinks?: { label: string; href?: string; onClick?: () => void }[]; onSignOut?: () => void; signOutHref?: string; signOutLabel?: string; className?: string }
export declare function TopBar(props: TopBarProps): React.ReactElement;
export interface PageHeaderProps { title: React.ReactNode; subtitle?: React.ReactNode; onBack?: () => void; backLabel?: string; status?: { status: StatusTagProps['status']; label: string; shortLabel?: string }; autosave?: 'saved'|'saving'|'error'; actions?: React.ReactNode; compactActions?: React.ReactNode; compact?: boolean; className?: string }
export declare function PageHeader(props: PageHeaderProps): React.ReactElement;
export interface CardProps { number?: number; title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; footer?: React.ReactNode; compact?: boolean; extend?: boolean; children?: React.ReactNode; className?: string }
export declare function Card(props: CardProps): React.ReactElement;
export interface DocumentAction { type?: 'edit'|'view'|'open'|'delete'|'upload'|'download'; icon?: IconName; label?: string; onClick?: () => void }
export interface DocumentItemProps { variant?: 'standard'|'under-review'|'actions-required'|'sgs'; docType: string; fileName?: string; dateLabel?: string; size?: string; status?: StatusTagProps['status']; statusLabel?: string; actions?: DocumentAction[]; compact?: boolean; accordionLabel?: string; defaultExpanded?: boolean; children?: React.ReactNode; className?: string }
export declare function DocumentItem(props: DocumentItemProps): React.ReactElement;
export interface ThreadMessage { id: string|number; author: string; role?: 'customer'|'sgs'; roleLabel?: string; time: string; body: React.ReactNode; internal?: boolean }
export interface CommentThreadProps { title?: string; count?: number; messages?: ThreadMessage[]; maxHeight?: number|string; onSend?: (text: string) => void; currentUser?: string; currentRole?: 'customer'|'sgs'; readOnly?: boolean; placeholder?: string; composerLabel?: string; emptyTitle?: string; emptyBody?: string; className?: string }
export declare function CommentThread(props: CommentThreadProps): React.ReactElement;
export interface LogoProps { siteName?: string; siteSub?: string; href?: string }
export declare function Logo(props: LogoProps): React.ReactElement;
export interface SidebarChild { id?: string; label: string; type?: 'label'; href?: string; badge?: React.ReactNode; badgeTone?: 'neutral'|'attention'; badgeLabel?: string }
export interface SidebarItem { id: string; label: string; icon: IconName; href?: string; badge?: React.ReactNode; badgeTone?: 'neutral'|'attention'; badgeLabel?: string; defaultOpen?: boolean; children?: SidebarChild[] }
export interface AppSidebarProps { sections?: { label?: string; items: SidebarItem[] }[]; items?: SidebarItem[]; active?: string; defaultActive?: string; onSelect?: (id: string, item: SidebarItem|SidebarChild) => void; collapsed?: boolean; defaultCollapsed?: boolean; onCollapsedChange?: (collapsed: boolean) => void; collapsible?: boolean; header?: React.ReactNode; label?: string; tone?: 'light'|'dark'; className?: string }
export declare function AppSidebar(props: AppSidebarProps): React.ReactElement;
export interface RequirementItem { id: string; code: string; title: string; status?: string }
export interface RequirementGroup { id: string; code?: string; title: string; progress?: number; count?: string; children?: RequirementItem[] }
export interface RequirementNavigatorProps { groups: RequirementGroup[]; framework?: { name: string; progress?: number; caption?: string }; selected?: string; defaultSelected?: string; onSelect?: (id: string, item: RequirementItem) => void; defaultExpanded?: string[]; searchable?: boolean; filterable?: boolean; searchPlaceholder?: string; filterOptions?: { value: string; label: string }[]; defaultFilter?: string; statusLabels?: Record<string, [StatusTagProps['status'], string]>; emptyStatusLabel?: string; label?: string; className?: string }
export declare function RequirementNavigator(props: RequirementNavigatorProps): React.ReactElement;
export interface NotificationItem { id: string; type?: 'status'|'review'|'certificate'|'assignment'|'user'|'document'; tone?: 'success'|'warning'|'error'|'info'; title: string; body?: string; ref?: string; time: string; group?: string; unread?: boolean; href?: string }
export interface NotificationCenterProps { items: NotificationItem[]; defaultTab?: 'unread'|'all'; hasMore?: boolean; onLoadMore?: () => void; onOpen?: (item: NotificationItem) => void; onMarkAllRead?: () => void; title?: string; label?: string; emptyTitle?: string; emptyUnreadTitle?: string; className?: string }
export declare function NotificationCenter(props: NotificationCenterProps): React.ReactElement;
export interface IconProps { name: IconName; size?: number; title?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;
declare global { interface Window { Graphite: { Button: typeof Button; IconButton: typeof IconButton; Link: typeof Link; FormField: typeof FormField; TextInput: typeof TextInput; Textarea: typeof Textarea; SearchInput: typeof SearchInput; Select: typeof Select; Checkbox: typeof Checkbox; Radio: typeof Radio; Toggle: typeof Toggle; Tag: typeof Tag; StatusTag: typeof StatusTag; Icon: typeof Icon; Tooltip: typeof Tooltip; Snackbar: typeof Snackbar; InlineNotification: typeof InlineNotification; Modal: typeof Modal; OverflowMenu: typeof OverflowMenu; Tabs: typeof Tabs; Breadcrumb: typeof Breadcrumb; Accordion: typeof Accordion; LanguageSelector: typeof LanguageSelector; Table: typeof Table; DataTable: typeof DataTable; Pagination: typeof Pagination; Popover: typeof Popover; Combobox: typeof Combobox; MultiSelect: typeof MultiSelect; DatePicker: typeof DatePicker; FileUpload: typeof FileUpload; ProgressBar: typeof ProgressBar; ReadinessRing: typeof ReadinessRing; Drawer: typeof Drawer; Avatar: typeof Avatar; NotificationBadge: typeof NotificationBadge; Separator: typeof Separator; Skeleton: typeof Skeleton; EmptyState: typeof EmptyState; TreeView: typeof TreeView; SectionNav: typeof SectionNav; TopBar: typeof TopBar; PageHeader: typeof PageHeader; Card: typeof Card; DocumentItem: typeof DocumentItem; CommentThread: typeof CommentThread; Logo: typeof Logo; AppSidebar: typeof AppSidebar; RequirementNavigator: typeof RequirementNavigator; NotificationCenter: typeof NotificationCenter } } }
