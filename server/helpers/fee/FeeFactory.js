import HotfixFee from './HotfixFee';
import NormalFee from './NormalFee';
import { issueType } from '../../constants/issue';

export default class FeeFactory {
  static getInstance(type, workingTimes = [], totalTime = 0, numOfWorker = 0) {
    if (type === issueType.HOTFIX) {
      return new HotfixFee(workingTimes, totalTime, numOfWorker);
    }

    return new NormalFee(workingTimes, totalTime, numOfWorker);
  }

  static getCost(
    type,
    { configuration, classFee, teamConfiguration },
    { workingTimes, totalTime, numOfWorker, holidays }
  ) {
    const instance = FeeFactory.getInstance(type, workingTimes, totalTime, numOfWorker);

    return instance.getCost(configuration, classFee, teamConfiguration, holidays);
  }

  static getSurveyCost(type, surveyTime, { configuration, classFee }) {
    const instance = FeeFactory.getInstance(type);

    return instance.getSurveyCost({ configuration, classFee, surveyTime });
  }
}
