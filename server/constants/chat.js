export const command = Object.freeze({
  REQUEST_UPDATE_PROGRESS: 'REQUEST_UPDATE_PROGRESS',
  REQUEST_CANCEL: 'REQUEST_CANCEL',
  REQUEST_SEND_MEDIA: 'REQUEST_SEND_MEDIA',
  REQUEST_ESTIMATION: 'REQUEST_ESTIMATION',
  SUBMIT_ESTIMATION: 'SUBMIT_ESTIMATION',
  APPROVAL_ESTIMATION: 'APPROVAL_ESTIMATION',
  INFORM_MATERIAL_COST: 'INFORM_MATERIAL_COST',
  REQUEST_ACCEPTANCE: 'REQUEST_ACCEPTANCE',
});

export const commandMessage = Object.freeze({
  REQUEST_UPDATE_PROGRESS: 'chat.update_progress',
  REQUEST_CANCEL: 'chat.cancel',
  REQUEST_SEND_MEDIA: 'chat.send_media',
  REQUEST_ESTIMATION: 'chat.estimate',
  SUBMIT_ESTIMATION: 'chat.submit_estimate',
  APPROVAL_ESTIMATION: 'chat.approval_estimate',
  INFORM_MATERIAL_COST: 'chat.inform_material_cost',
  REQUEST_ACCEPTANCE: 'chat.request_acceptance',
});

export const commandRequests = [
  command.REQUEST_ACCEPTANCE,
  command.REQUEST_UPDATE_PROGRESS,
  command.REQUEST_ESTIMATION,
  command.REQUEST_CANCEL,
  command.REQUEST_SEND_MEDIA,
];
