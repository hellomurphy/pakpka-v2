import { reactive } from "vue";

interface ConfirmOptions {
  title: string;
  message: string;
  intent?: "info" | "success" | "warning" | "danger";
  confirmText?: string;
  cancelText?: string;
}

interface PromiseControls {
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}

const state = reactive({
  show: false,
  title: "ยืนยันการกระทำ",
  message: "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?",
  intent: "info" as const,
  confirmText: "ยืนยัน",
  cancelText: "ยกเลิก",
});

let promiseControls: PromiseControls | null = null;

export const useConfirm = () => {
  const show = (options: ConfirmOptions) => {
    state.title = options.title;
    state.message = options.message;
    state.intent = options.intent || "info";
    state.confirmText = options.confirmText || "ยืนยัน";
    state.cancelText = options.cancelText || "ยกเลิก";
    state.show = true;

    return new Promise<boolean>((resolve, reject) => {
      promiseControls = { resolve, reject };
    });
  };

  const confirm = () => {
    if (promiseControls) {
      promiseControls.resolve(true);
      promiseControls = null;
    }
    state.show = false;
  };

  const cancel = () => {
    if (promiseControls) {
      promiseControls.resolve(false);
      promiseControls = null;
    }
    state.show = false;
  };

  return {
    state,
    show,
    confirm,
    cancel,
  };
};
