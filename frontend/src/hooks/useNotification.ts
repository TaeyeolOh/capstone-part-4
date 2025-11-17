import { useSnackbar, VariantType, OptionsObject } from "notistack";

export function useNotification() {
  const { enqueueSnackbar } = useSnackbar();

  const show = (
    message: string,
    variant: VariantType = "default",
    options?: OptionsObject
  ) => {
    enqueueSnackbar(message, { variant, ...options });
  };

  return {
    showSuccess: (msg: string, options?: OptionsObject) => show(msg, "success", options),
    showError: (msg: string, options?: OptionsObject) => show(msg, "error", options),
    showInfo: (msg: string, options?: OptionsObject) => show(msg, "info", options),
    showWarning: (msg: string, options?: OptionsObject) => show(msg, "warning", options),
  };
}
