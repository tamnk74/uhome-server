import HotfixFee from './HotfixFee';
import NormalFee from './NormalFee';
import { issueType } from '../../constants/issue';

export default class FeeFactory {
  static getInstance(type, workingTimes, totalTime, numOfWorker) {
    if (type === issueType.HOTFIX) {
      return new HotfixFee(workingTimes, totalTime, numOfWorker);
    }

    return new NormalFee(workingTimes, totalTime, numOfWorker);
  }

  static getFee(
    type,
    { configuration, classFee, teamConfiguration },
    { workingTimes, totalTime, numOfWorker }
  ) {
    const instance = FeeFactory.getInstance(type, workingTimes, totalTime, numOfWorker);

    return instance.getFee(configuration, classFee, teamConfiguration);
  }
}
