import FeatureBase from "./FeatureBase";
import { CommentSender } from "./Features/CommentSender";

const startEverything = (features: FeatureBase[]) => {
    Promise.all(features.map(f => f.start()));
}

startEverything([
    new CommentSender()
]);