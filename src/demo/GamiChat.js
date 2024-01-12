import React, { useEffect, useRef, useState } from 'react';
import UserList from './UserList';
import SendbirdChat from '@sendbird/chat';
import { SENDBIRD_INFO } from '../constants/constants';
import { createChannel, debounce, generateChannelName, loadChannels, loadMessages, sendMessage } from '../utils/channelUtils';
import { GroupChannelModule } from '@sendbird/chat/groupChannel';
import UploadModalButton from './UploadModalButton';

const USERS = [
  { id: 'charly', name: 'Charly' },
  { id: 'doe', name: 'Jhon' },
  { id: '01', name: 'Janeth' },
]

const GamiChat = () => {
  const [activeUser, setActiveUser] = useState()
  const [typing, setTyping] = useState(false);
  const [sb, setSb] = useState()
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState([])
  const [activeMessages, setActiveMessages] = useState([])
  const [, setMessageCollection] = useState()
  const [selectedUser, setSelectedUser] = useState()
  const inputRef = useRef();
  const messagesBoxRef = useRef();

  //need to access state in message received callback
  const activeMessagesRef = useRef();
  const activeChannelsRef = useRef();
  activeMessagesRef.current = activeMessages;
  activeChannelsRef.current = activeChannel;

  useEffect(() => {
    if (!messagesBoxRef.current) return;
    messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
  }, [activeMessages])

  console.log(activeMessages)

  const selectActiveUser = async (user) => {
    // reset messages
    setActiveChannel()
    setActiveMessages([])
    setSelectedUser();
    setSb()
    setChannels()

    // Active user
    setActiveUser(user);

    // Create sendbird instance
    const sendbirdChat = await SendbirdChat.init({
      appId: SENDBIRD_INFO.appId,
      localCacheEnabled: true,
      modules: [new GroupChannelModule()]
    });

    try {
      // connect active user
      await sendbirdChat.connect(user.id);
    } catch (e) {
      console.log("error", e)
    }

    // get list of channels
    const channels = await loadChannels(sendbirdChat, channelHandlers);
    setChannels(channels);

    // set sendbird instance
    setSb(sendbirdChat);
  }

  const createOpenChannel = async (userId) => {
    if(!activeUser) return;

    const selectedUser = USERS.find(({id}) => id === userId);
    setSelectedUser(selectedUser);
    const channelName = generateChannelName(activeUser.id, userId);
    const existinChannel = channels.find(channel => channel.url === channelName);

    if(!existinChannel) {
      const groupChannel = await createChannel(channelName, userId, sb);
      setChannels([...channels, groupChannel]);
      setActiveChannel(groupChannel);
      const activeMessageCollection = await loadMessages(groupChannel, messageHandlers, (_, messages) => {
        setActiveMessages(messages.reverse())
      });
      setMessageCollection(activeMessageCollection);
    }else{
      setActiveChannel(existinChannel);
      existinChannel.markAsRead();

      setChannels(channels.map(channel => {
        if(channel.url === existinChannel.url) {
          existinChannel.unreadMessageCount = 0;
          return existinChannel;
        };
        return channel;
      }))
      const activeMessageCollection = await loadMessages(existinChannel, messageHandlers, (_, messages) => {
        setActiveMessages(messages.reverse())
      });
      setMessageCollection(activeMessageCollection);
    }

  }

  const sendMessageHandler = () => {
    if(!activeChannel) return;
    const message = inputRef.current.value;
    sendMessage(message, activeChannel);
    inputRef.current.value = "";
  }


  // channel handler
  const channelHandlers = {
    onChannelsAdded: (context, channels) => {
    },
    onChannelsDeleted: (context, channels) => {
    },
    onChannelsUpdated: (context, channels) => {
      if(activeChannelsRef.current){
        const members = activeChannelsRef.current.getTypingUsers();
        setTyping(!!members.length);
      }
    }
  }


  // message handlers for our channler
  const messageHandlers = {
    onMessagesAdded: (context, channel, messages) => {
      setActiveMessages([...activeMessagesRef.current , messages[0]])
    },
    onMessagesUpdated: (context, channel, messages) => {
    },
    onMessagesDeleted: (context, channel, messageIds) => {
    },
    onChannelUpdated: (context, channel) => {

    },
    onChannelDeleted: (context, channelUrl) => {
    },
    onHugeGapDetected: () => {
    }
  }

  const renderInactiveUserState = () => (
    <div className="w-full h-screen flex  items-center justify-center font-bold text-xl">
      <img src="User.png" alt="" />
      Select an active user from the sidebar!
    </div>
  )

  const emptyState = () => (
    <div className="w-full h-screen flex  items-center justify-center font-bold text-xl">
      <img src="EmptyState.png" alt="" />
      Select a Channel from the sidebar to start chatting!
    </div>
  )

  const renderMessage = (message) => {
    const isActiveUser = message.sender.userId === activeUser?.id;

    return <div className={`flex w-full my-4 ${isActiveUser ? "justify-start" : "justify-end"}`}>
      <p key={message.reqId} className={`  message`}>
        <span className="user-info">
          <strong>{message.sender.nickname}</strong>
          <small>{new Date(message.createdAt).toLocaleString()}</small>
        </span>
        <br />
        { message.customType === "image" ? <img src={message.message} alt="Bubble"/> : <span dangerouslySetInnerHTML={{ __html: message.message }} />}
      </p>
      </div>;
  }

  const endTyping = debounce(() => {
    activeChannelsRef.current.endTyping();
    console.log("entro aca finali")
  }, 700)

  const onMessageInputChange =  (event) => {
    activeChannelsRef.current.startTyping();
    endTyping();
  }

  return (
    <div className="flex h-screen w-full">
      <UserList users={USERS} setActiveUser={selectActiveUser} activeUser={activeUser} createOpenChannel={createOpenChannel} showUsers={activeUser && sb} channels={channels}/>
      <div className=" w-full bg-white p-4">
        { activeChannel && activeUser  && activeMessages ? (
          <>
            <div className='flex w-full'>
              <img className="rounded-xl w-7 mr-4" src="profile_img.png" alt="" />
              <h1 className='text-xl'>{selectedUser?.name}</h1>
            </div>
            {/* messages  */}
            <div className="w-full h-5/6 flex flex-col overflow-y-scroll " ref={messagesBoxRef}>
              {activeMessages.map(renderMessage)}
            </div>

            <div className="flex">
              <input
                type="text"
                onChange={onMessageInputChange}
                className="w-full border border-gray-300 p-2 rounded-lg mr-2"
                placeholder="Type your message..."
                autoFocus
                ref={inputRef}
              />
              <button onClick={sendMessageHandler} className="bg-blue-500 text-white rounded-lg px-4 py-2">Send</button>
              <UploadModalButton sendMessage={sendMessage} activeChannel={activeChannel}/>
            </div>
            { typing ? <div>Typing....</div> : null }
          </>
        ) : !activeUser ? renderInactiveUserState() : emptyState()
      }
      </div>
    </div>
  );
};

export default GamiChat;