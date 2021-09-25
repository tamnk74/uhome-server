import { chatMessageQueue } from '../../helpers/Queue';
import ChatService from '../service/chat';

chatMessageQueue.process('update_message', ChatService.updateMessage);
