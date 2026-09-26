import type * as React from 'react';
export type IconName = 'checkmark--filled'|'time--filled'|'warning--alt--filled'|'warning--filled'|'misuse'|'circle-dash'|'information--filled'|'search'|'chevron--down'|'close'|'arrow--right'|'add'|'view'|'view--off'|'overflow-menu--vertical'|'earth'|'checkmark';
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
export interface SelectProps extends FieldProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> { options: { value: string; label: string }[]; placeholder?: string }
export declare function Select(props: SelectProps): React.ReactElement;
export interface ChoiceProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: React.ReactNode }
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
export interface ModalProps { open: boolean; title: React.ReactNode; children?: React.ReactNode; onClose?: () => void; primaryAction?: ModalAction; secondaryAction?: ModalAction; danger?: boolean; size?: 'sm'|'md'|'lg'; dismissOnOverlay?: boolean; inline?: boolean }
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
export interface IconProps { name: IconName; size?: number; title?: string; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;
declare global { interface Window { Graphite: { Button: typeof Button; IconButton: typeof IconButton; Link: typeof Link; FormField: typeof FormField; TextInput: typeof TextInput; Textarea: typeof Textarea; SearchInput: typeof SearchInput; Select: typeof Select; Checkbox: typeof Checkbox; Radio: typeof Radio; Toggle: typeof Toggle; Tag: typeof Tag; StatusTag: typeof StatusTag; Icon: typeof Icon; Tooltip: typeof Tooltip; Snackbar: typeof Snackbar; InlineNotification: typeof InlineNotification; Modal: typeof Modal; OverflowMenu: typeof OverflowMenu; Tabs: typeof Tabs; Breadcrumb: typeof Breadcrumb; Accordion: typeof Accordion; LanguageSelector: typeof LanguageSelector } } }
