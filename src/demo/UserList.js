import { generateChannelName } from "../utils/channelUtils";

const UserList = ({ users, setActiveUser, activeUser, createOpenChannel, showUsers, channels }) => {
  const selectActiveUser = (event) => {
    const userId = event.target.value;
    const selectedUser = users.find(({id}) => userId === id);
    if (!selectedUser) return;
    setActiveUser(selectedUser);
  }

  const filteredListUser = activeUser ? users.filter(user => user !== activeUser) : users;

  const findChannel  = (channelId) => {
    console.log(channelId)
    return channels.find(({url}) => channelId === url)
  }

  const renderUserRow = (user) => {
    const channelId = generateChannelName(user.id, activeUser.id);
    const currentChannel = findChannel(channelId);

    return <li className="flex items-center cursor-pointer" key={user.id} onClick={() => createOpenChannel(user.id)}>
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
      {user.name}
      {currentChannel?.unreadMessageCount > 0 ?
        <div className="rounded bg-green-300"> {currentChannel.unreadMessageCount}
        </div> : null}
    </li>
  }
  return (
    <div className="w-1/4 bg-gray-200 p-4">
      <div className="my-4 flex">
        <h1 className="text-lg font-bold mr-4">Active User {activeUser?.name}</h1>
        <select className=" border-gray" onChange={selectActiveUser}>
          <option value=""></option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
            ))
          }
        </select>
      </div>

     {showUsers ?
        <ul className="space-y-2">
          {filteredListUser.map(renderUserRow)}
        </ul>
      : null} 
      
    </div>
  );
}

export default UserList;