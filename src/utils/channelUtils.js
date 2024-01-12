import { GroupChannelFilter, GroupChannelListOrder, MessageCollectionInitPolicy, MessageFilter, MyMemberStateFilter } from "@sendbird/chat/groupChannel";

export const createChannel = async (channelName, receptorId, sb) => {
    try {
        const openChannelParams = {};
        openChannelParams.name = channelName;
        openChannelParams.channelUrl = channelName;
        openChannelParams.operatorUserIds = [sb.currentUser.userId, receptorId];
        openChannelParams.invitedUserIds = [sb.currentUser.userId, receptorId];

        const groupChannel = await sb.groupChannel.createChannel(openChannelParams);
        return groupChannel;
    } catch (error) {
        console.log([null, error]);
    }
}

export const generateChannelName = (currentId, secondUserId) => {
  return [currentId, secondUserId].toSorted().join("_");
}

// Helpful functions that call Sendbird
export const loadChannels = async (sb) => {
    const groupChannelFilter = new GroupChannelFilter();
    groupChannelFilter.includeEmpty = true;
    groupChannelFilter.myMemberStateFilter = MyMemberStateFilter.ALL;

    const collection = sb.groupChannel.createGroupChannelCollection({
        filter: groupChannelFilter,
        order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
    });

    //collection.setGroupChannelCollectionHandler(channelHandlers);

    const channels = await collection.loadMore();
    return channels;
}


export const loadMessages = (channel, messageHandlers, onApiResult) => {
    const messageFilter = new MessageFilter();

    const collection = channel.createMessageCollection({
        filter: messageFilter,
        startingPoint: Date.now(),
        limit: 100
    });

    collection.setMessageCollectionHandler(messageHandlers);
    collection
        .initialize(MessageCollectionInitPolicy.CACHE_AND_REPLACE_BY_API)
        // .onCacheResult(onApiResult)
        .onApiResult(onApiResult);
    return collection;
}


export const deleteChannel = async (channelUrl, sb) => {
    try {
        const channel = await sb.openChannel.getChannel(channelUrl);
        await channel.delete();
        return [channel, null];
    } catch (error) {
        return [null, error];
    }
}

export const updateChannel = async (currentlyUpdatingChannel, channelNameInputValue, sb) => {
    try {
        const channel = await sb.openChannel.getChannel(currentlyUpdatingChannel.url);
        const openChannelParams = {};
        openChannelParams.name = channelNameInputValue;
        openChannelParams.operatorUserIds = [sb.currentUser.userId];
        const updatedChannel = await channel.updateChannel(openChannelParams);
        return [updatedChannel, null];
    } catch (error) {
        return [null, error];
    }
}

export const deleteMessage = async (currentlyJoinedChannel, messageToDelete) => {
    await currentlyJoinedChannel.deleteMessage(messageToDelete);
}

export const sendMessage = async (message, channel) => {
  const userMessageParams = {};
  userMessageParams.message = message;
  channel.sendUserMessage(userMessageParams)
    .onSucceeded((message) => {
      console.log("message sent", message)
    })
    .onFailed((error) => {
      console.log(error)
      console.log("failed")
    });
}