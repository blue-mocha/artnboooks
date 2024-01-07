import { useContext, useEffect, useCallback} from 'react';
import { UNSAFE_NavigationContext as NavigationContext} from 'react-router-dom';
import io from "socket.io-client";
import axios from "axios";

export function useBlocker(blocker, when = true) {
	const { navigator } = useContext(NavigationContext);
	
	useEffect(() => {
		if(!when) return;
		
		const unblock = navigator.block((tx) => {
			const autoUnblockingTx = {
				...tx,
				retry() {
					unblock();
					tx.retry();
				},
			};
			blocker(autoUnblockingTx);
		});
		return unblock;
	}, [navigator, blocker, when]);
}

export function usePrompt(message, when = true, {roomName: isbn, users : name}){

	const URL = process.env.REACT_APP_SERVER_URL;
    const socket = io.connect(URL, {withCredentials: true});
    
	const blocker = useCallback(async (tx) => {
	
		if(window.confirm(message)){ 
          //(db유저삭제 & 소켓연결 끊기)

		  const response = await axios.post(`${URL}/chat/delete`, {
			    roomName: isbn, users : name});

			if(response.status === 200){
				socket.emit('disconnectChat',{roomName: isbn, userName: name});
				socket.disconnect();
		       }
			 tx.retry(); 
		}
	}, [message]);
	
	useBlocker(blocker, when);
}
