export const command = Object.freeze({
  REQUEST_UPDATE_PROGRESS: 'REQUEST_UPDATE_PROGRESS',
  REQUEST_CANCEL: 'REQUEST_CANCEL',
  REQUEST_SEND_MEDIA: 'REQUEST_SEND_MEDIA',
  REQUEST_ESTIMATION_TIME: 'REQUEST_ESTIMATION_TIME',
  SUBMIT_ESTIMATION_TIME: 'SUBMIT_ESTIMATION_TIME',
  APPROVAL_ESTIMATION_TIME: 'APPROVAL_ESTIMATION_TIME',
  INFORM_MATERIAL_COST: 'INFORM_MATERIAL_COST',
  APPROVAL_MATERIAL_COST: 'APPROVAL_MATERIAL_COST',
  REQUEST_ACCEPTANCE: 'REQUEST_ACCEPTANCE',
  CONTINUE_CHATTING: 'CONTINUE_CHATTING',
  UPDATED_PROGRESS: 'UPDATED_PROGRESS',
  ACCEPTANCE: 'ACCEPTANCE',
  REQUEST_ADD_MORE_INFORMATION: 'REQUEST_ADD_MORE_INFORMATION',
  ADDED_MORE_INFORMATION: 'ADDED_MORE_INFORMATION',
  CANCELED: 'CANCELED',
  ADDED_PROMOTION: 'ADDED_PROMOTION',
});

export const commandMessage = Object.freeze({
  REQUEST_UPDATE_PROGRESS: 'chat.update_progress',
  REQUEST_CANCEL: 'chat.cancel',
  REQUEST_SEND_MEDIA: 'chat.send_media',
  REQUEST_ESTIMATION_TIME: 'chat.estimate_time',
  SUBMIT_ESTIMATION_TIME: 'chat.submit_estimate_time',
  APPROVAL_ESTIMATION_TIME: 'chat.approval_estimate_time',
  INFORM_MATERIAL_COST: 'chat.inform_material_cost',
  APPROVAL_MATERIAL_COST: 'chat.approval_material_cost',
  REQUEST_ACCEPTANCE: 'chat.request_acceptance',
  CONTINUE_CHATTING: 'chat.continue_chatting',
  UPDATED_PROGRESS: 'chat.updated_progress',
  ACCEPTANCE: 'chat.acceptance',
  REQUEST_ADD_MORE_INFORMATION: 'chat.request_add_more_information',
  ADDED_MORE_INFORMATION: 'chat.added_more_information',
  CANCELED: 'chat.canceled',
  ADDED_PROMOTION: 'chat.added_promotion',
});

export const commandRequests = [
  command.REQUEST_ACCEPTANCE,
  command.REQUEST_UPDATE_PROGRESS,
  command.REQUEST_ESTIMATION_TIME,
  command.REQUEST_CANCEL,
  command.REQUEST_SEND_MEDIA,
  command.CONTINUE_CHATTING,
  command.REQUEST_ADD_MORE_INFORMATION,
];

export const notificationMessage = Object.freeze({
  REQUEST_UPDATE_PROGRESS: 'notfication.update_progress',
  REQUEST_CANCEL: 'notfication.cancel',
  REQUEST_SEND_MEDIA: 'notfication.send_media',
  REQUEST_ESTIMATION_TIME: 'notfication.estimate_time',
  SUBMIT_ESTIMATION_TIME: 'notfication.submit_estimate_time',
  APPROVAL_ESTIMATION_TIME: 'notfication.approval_estimate_time',
  INFORM_MATERIAL_COST: 'notfication.inform_material_cost',
  APPROVAL_MATERIAL_COST: 'notfication.approval_material_cost',
  REQUEST_ACCEPTANCE: 'notfication.request_acceptance',
  CONTINUE_CHATTING: 'notfication.continue_chatting',
  UPDATED_PROGRESS: 'notfication.updated_progress',
  ACCEPTANCE: 'notfication.acceptance',
  REQUEST_ADD_MORE_INFORMATION: 'notfication.request_add_more_information',
  ADDED_MORE_INFORMATION: 'notfication.added_more_information',
  CANCELED: 'notfication.canceled',
  NEW_MESSAGE: 'notfication.new_message',
});

export const estimationMessageStatus = Object.freeze({
  CANCELED: 'CANCELED',
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
});
