type OpenAuthSheetOptions = {
    onSuccess?: () => void;
};

type AuthSheetListener = (options?: OpenAuthSheetOptions) => void;

let listener: AuthSheetListener | null = null;

export const setAuthSheetListener = (nextListener: AuthSheetListener | null) => {
    listener = nextListener;
};

export const openAuthSheet = (options?: OpenAuthSheetOptions) => {
    listener?.(options);
};
