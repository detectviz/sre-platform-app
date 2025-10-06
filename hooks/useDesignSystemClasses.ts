import { useMemo } from 'react';

interface SurfaceClassMap {
    card: string;
    inset: string;
}

interface TextClassMap {
    primary: string;
    emphasis: string;
    secondary: string;
    muted: string;
    inverse: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    neutral: string;
}

interface FieldClassMap {
    base: string;
    invalid: string;
    disabled: string;
}

interface FieldMessageClassMap {
    helper: string;
    error: string;
}

interface ButtonClassMap {
    primary: string;
    secondary: string;
    danger: string;
}

interface MeterClassMap {
    container: string;
    segment: string;
    success: string;
    warning: string;
    inactive: string;
}

interface LayoutClassMap {
    sectionDivider: string;
}

export interface DesignSystemClassMap {
    surface: SurfaceClassMap;
    text: TextClassMap;
    field: FieldClassMap;
    fieldMessage: FieldMessageClassMap;
    button: ButtonClassMap;
    meter: MeterClassMap;
    layout: LayoutClassMap;
}

const SURFACE_CLASSES: SurfaceClassMap = {
    card: 'app-surface app-surface--raised app-surface--padded',
    inset: 'app-surface app-surface--inset app-surface--padded',
};

const TEXT_CLASSES: TextClassMap = {
    primary: 'app-text-primary',
    emphasis: 'app-text-emphasis',
    secondary: 'app-text-secondary',
    muted: 'app-text-muted',
    inverse: 'app-text-inverse',
    success: 'app-text-success',
    warning: 'app-text-warning',
    danger: 'app-text-danger',
    info: 'app-text-info',
    neutral: 'app-text-neutral',
};

const FIELD_CLASSES: FieldClassMap = {
    base: 'app-field',
    invalid: 'app-field app-field--invalid',
    disabled: 'app-field app-field--disabled',
};

const FIELD_MESSAGE_CLASSES: FieldMessageClassMap = {
    helper: 'app-field__message',
    error: 'app-field__message app-field__message--error',
};

const BUTTON_CLASSES: ButtonClassMap = {
    primary: 'app-btn app-btn--primary',
    secondary: 'app-btn app-btn--ghost',
    danger: 'app-btn app-btn--danger',
};

const METER_CLASSES: MeterClassMap = {
    container: 'app-meter',
    segment: 'app-meter__segment',
    success: 'app-meter__segment--success',
    warning: 'app-meter__segment--warning',
    inactive: 'app-meter__segment--inactive',
};

const LAYOUT_CLASSES: LayoutClassMap = {
    sectionDivider: 'app-section-divider',
};

export const useDesignSystemClasses = (): DesignSystemClassMap =>
    useMemo(
        () => ({
            surface: SURFACE_CLASSES,
            text: TEXT_CLASSES,
            field: FIELD_CLASSES,
            fieldMessage: FIELD_MESSAGE_CLASSES,
            button: BUTTON_CLASSES,
            meter: METER_CLASSES,
            layout: LAYOUT_CLASSES,
        }),
        [],
    );
