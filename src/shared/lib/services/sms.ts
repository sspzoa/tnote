import { SolapiMessageService } from "solapi";

const apiKey = process.env.SOLAPI_API_KEY;
const apiSecret = process.env.SOLAPI_API_SECRET;

const messageService = apiKey && apiSecret ? new SolapiMessageService(apiKey, apiSecret) : null;

export interface SendSMSParams {
  to: string;
  text: string;
  from: string;
  subject?: string;
}

export interface SendSMSResult {
  success: boolean;
  groupId?: string;
  messageId?: string;
  statusCode?: string;
  statusMessage?: string;
  error?: string;
}

export interface BulkSendSMSParams {
  recipients: string[];
  text: string;
  from: string;
  subject?: string;
}

export interface BulkSendSMSResult {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  groupId?: string;
  error?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getStatusMessage = (statusCode: string): string => {
  const statusMessages: Record<string, string> = {
    "2000": "정상 접수",
    "3000": "이통사로 접수 완료",
    "4000": "수신 완료",
  };
  return statusMessages[statusCode] || `오류 (${statusCode})`;
};

const isDeliveryComplete = (statusCode: string): boolean => {
  return statusCode === "4000";
};

const isDeliveryFailed = (statusCode: string): boolean => {
  const code = Number.parseInt(statusCode, 10);
  return (code >= 1000 && code < 2000) || (code > 3000 && code < 4000);
};

export const sendSMS = async ({ to, text, from, subject }: SendSMSParams): Promise<SendSMSResult> => {
  if (!messageService) {
    return { success: false, error: "SMS 서비스가 설정되지 않았습니다." };
  }

  if (!from) {
    return { success: false, error: "발신번호가 설정되지 않았습니다." };
  }

  try {
    const cleanedTo = to.replace(/-/g, "");
    const cleanedFrom = from.replace(/-/g, "");

    const result = await messageService.send({
      to: cleanedTo,
      from: cleanedFrom,
      text,
      ...(subject && { subject }),
    });

    const groupId = result.groupInfo.groupId;

    const retryDelay = 1000;
    const maxRetries = 30;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await sleep(retryDelay);

      const messages = await messageService.getMessages({ groupId });

      if (messages.messageList && Object.keys(messages.messageList).length > 0) {
        const messageId = Object.keys(messages.messageList)[0];
        const message = messages.messageList[messageId];
        const statusCode = message.statusCode || "2000";

        if (isDeliveryComplete(statusCode)) {
          return {
            success: true,
            groupId,
            messageId,
            statusCode,
            statusMessage: getStatusMessage(statusCode),
          };
        }

        if (isDeliveryFailed(statusCode)) {
          return {
            success: false,
            groupId,
            messageId,
            statusCode,
            statusMessage: getStatusMessage(statusCode),
            error: getStatusMessage(statusCode),
          };
        }
      }
    }

    return {
      success: true,
      groupId,
      statusCode: "2000",
      statusMessage: "정상 접수 (전송 확인 타임아웃)",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return { success: false, error: errorMessage };
  }
};

export const sendBulkSMS = async ({
  recipients,
  text,
  from,
  subject,
}: BulkSendSMSParams): Promise<BulkSendSMSResult> => {
  if (!messageService) {
    return {
      success: false,
      total: recipients.length,
      successCount: 0,
      failCount: recipients.length,
      error: "SMS 서비스가 설정되지 않았습니다.",
    };
  }

  if (!from) {
    return {
      success: false,
      total: recipients.length,
      successCount: 0,
      failCount: recipients.length,
      error: "발신번호가 설정되지 않았습니다.",
    };
  }

  try {
    const cleanedFrom = from.replace(/-/g, "");
    const messages = recipients.map((to) => ({
      to: to.replace(/-/g, ""),
      from: cleanedFrom,
      text,
      ...(subject && { subject }),
    }));

    const result = await messageService.send(messages);

    const successCount = result.groupInfo.count.registeredSuccess;
    const failCount = result.groupInfo.count.registeredFailed;

    return {
      success: failCount === 0,
      total: recipients.length,
      successCount,
      failCount,
      groupId: result.groupInfo.groupId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return {
      success: false,
      total: recipients.length,
      successCount: 0,
      failCount: recipients.length,
      error: errorMessage,
    };
  }
};

export const isSMSServiceAvailable = (): boolean => {
  return messageService !== null;
};
