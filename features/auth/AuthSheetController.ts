type OpenAuthSheetOptions = {
    onSuccess?: () => void;
    onCancel?: () => void;
};

type AuthSheetListener = (options?: OpenAuthSheetOptions) => void;

let listener: AuthSheetListener | null = null;
let pendingOptions: OpenAuthSheetOptions | undefined;
let hasPendingOpen = false;

export const setAuthSheetListener = (nextListener: AuthSheetListener | null) => {
    listener = nextListener;

    if (listener && hasPendingOpen) {
        const options = pendingOptions;

        pendingOptions = undefined;
        hasPendingOpen = false;
        listener(options);
    }
};

export const openAuthSheet = (options?: OpenAuthSheetOptions) => {
    if (!listener) {
        pendingOptions = options;
        hasPendingOpen = true;
        return;
    }

    listener(options);
};
