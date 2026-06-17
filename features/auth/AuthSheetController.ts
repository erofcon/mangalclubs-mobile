type OpenAuthSheetOptions = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

type AuthSheetListener = (options?: OpenAuthSheetOptions) => void;

let listener: AuthSheetListener | null = null;

export const setAuthSheetListener = (nextListener: AuthSheetListener | null) => {
    listener = nextListener;
};

export const openAuthSheet = (options?: OpenAuthSheetOptions) => {
    listener?.(options);
};
