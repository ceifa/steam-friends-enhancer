import FeatureBase from "./FeatureBase";
import { CommentSender } from "./Features/CommentSender";
import { FriendSelector } from "./Features/FriendSelector";

const startEverything = (features: FeatureBase[]) => {
    Promise.all(features.map(f => f.start()));
}

window.addEventListener('load', async () =>
    startEverything([
        new CommentSender(),
        new FriendSelector()
    ]));