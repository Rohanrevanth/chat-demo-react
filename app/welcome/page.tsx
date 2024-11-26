"use client"

import React, { useState, useEffect, useRef } from 'react';
import Header from "../components/header";
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import Image from "next/image";
import { ThreeDot } from 'react-loading-indicators';
import { API_URL, WEBSOCKET_URL } from '../global';
// Modal.setAppElement('#main');


export default function Page() {

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);

  const [loggedinUser, setLoggedinUser] = useState<any>();
  const loggedinUserRef = useRef(loggedinUser);

  const conversationsRef = useRef(conversations);
  const activeConversationRef = useRef(activeConversation);

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [attachmentUrls, setAttachmentUrls] = useState({});
  const attachmentUrlsRef = useRef(attachmentUrls);


  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketMessages, setsocketMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  // const ws = new WebSocket('ws://localhost:8080/ws');


  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const [isAttachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [modalAttachment, setModalAttachment] = useState(null);

  const [loading, setLoading] = useState(false);

  // Open modal and set selected attchment URL
  const openAttachmentModal = (fileName: any) => {
    console.log("opening attach")
    // var fileUrl = attachmentUrlsRef.current[fileName]
    setModalAttachment(fileName);
    setAttachmentModalOpen(true);
  };

  // Close modal
  const closeAttachmentModal = () => {
    setModalAttachment(null);
    setAttachmentModalOpen(false);
  };

  useEffect(() => {
    // Fetch conversations for a logged-in user when the component mounts
    const user = localStorage.getItem('user');
    if (user) {
      var user_ = JSON.parse(user)
      setLoggedinUser(user_)
      loggedinUserRef.current = user_;
      getUserConversations(user_.ID);
    }

    const ws = new WebSocket(WEBSOCKET_URL + '/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      // Optionally attempt reconnection after a delay
      setTimeout(() => {
        console.log('Reconnecting WebSocket...');
        setSocket(new WebSocket(WEBSOCKET_URL + '/ws'));
      }, 5000); // Reconnect after 5 seconds
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
      const message = JSON.parse(event.data);

      handleSocketMessages(message)
    };

    return () => {
      ws.close();
    };
  }, []);


  function handleSocketMessages(message: any) {
    console.log(message)
    console.log(conversations)
    console.log(conversationsRef)
    if (loggedinUserRef && message.profileid == loggedinUserRef.current.ID) {
      if (message.type == "FRIEND_REQUEST") {
        toast.info("You got a friend request!")
        getUserConversations(loggedinUserRef.current.ID)
      } else {
        if (message.type == "NEW_MESSAGE") {
          toast.info("You got a new message!")
        }
        if (message.type == "FRIEND_ADDED") {
          toast.info("Someone added you as a friend!")
        }
        var convoIndex = conversationsRef.current.findIndex((convo_: any) => convo_.ID == message.conversationid);
        console.log(convoIndex)
        if (convoIndex != -1) {
          getConversation(conversationsRef.current[convoIndex], true)
        }
      }
    }
    if (loggedinUserRef && message.chatuserid == loggedinUserRef.current.ID) {
      if (message.type == "FRIEND_REQUEST") {
        toast.info("Friend request sent!")
        getUserConversations(loggedinUserRef.current.ID)
      }
    }
  };

  // const sendSocketMessage = () => {
  //   if (socket && inputMessage.trim() !== '') {
  //     socket.send(inputMessage);
  //     setInputMessage(''); // Clear the input after sending
  //   }

  //   console.log(socketMessages)
  // };

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function handleFileChange(files: FileList | null) {
    console.log(files)
    if (files) {


      const fileArray = Array.from(files);
      setSelectedFiles([...selectedFiles, ...fileArray]); // Add selected files to the attachments array


      // setSelectedFiles(files);


      // Process and send the message and/or file
      // const formData = new FormData();
      // if (selectedFile) {
      //   formData.append('file', selectedFile);
      // }
      // if (message) {
      //   formData.append('message', message);
      // }

      // // Replace with your actual API request
      // await fetch('/api/sendMessage', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Clear input fields after sending
      // setSelectedFile(null);
    }
  }

  const removeAttachment = (index: any) => {
    setSelectedFiles((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    ); // Remove file from attachments
  };

  const clearAllAttachments = () => {
    setSelectedFiles([]); // Clear the selected files
  };

  const isImage = (fileName: any) => /\.(jpg|jpeg|png|gif|bmp|ico|webp|svg|tiff|tif)$/i.test(fileName);
  const isPDF = (fileName: any) => /\.pdf$/i.test(fileName);
  const isAudio = (fileName: any) => /\.(mp3|wav|ogg)$/i.test(fileName);
  const isVideo = (fileName: any) => /\.(mp4|webm|ogg)$/i.test(fileName);
  const isDocument = (fileName: any) => /\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(fileName);

  async function getAllAttachmentsInConversation(messages: any) {
    for (const msg of messages) {
      if (msg.files) {

        for (const fileName of msg.files) {
          if (!attachmentUrls[fileName]) {
            try {
              const fileUrl = await getFile(fileName); // Fetch the file URL asynchronously
              attachmentUrls[fileName] = fileUrl; // Store the file URL in state
            } catch (error) {
              console.error(`Error fetching file URL for ${fileName}:`, error);
            }
          }
        }
      }
    }
    attachmentUrlsRef.current = attachmentUrls
    setAttachmentUrls(prevUrls => ({ ...prevUrls, ...attachmentUrls }));
  }

  async function getFile(fileName: string) {
    console.log("getting file", fileName);
    try {
      var body = {
        name: fileName,
        // conversationid: id,
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/getfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        toast.error('Failed to get file. Please try again.')
        return
      }

      // Handle response if necessary
      console.log(response)
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob); // Convert the file to a URL
      return fileUrl;
    } catch (error: any) {
      console.error(error)
      toast.error(error)
      return null
    }
  };

  async function getUserConversations(id: any) {
    console.log("getting conversations");
    try {
      var body = {
        chatuserid: id,
        profileid: id,
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/getconversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        toast.error('Failed to get all conversations. Please try again.')
        return
      }

      // Handle response if necessary
      const data = await response.json()
      console.log(data)
      setConversations(data)
      conversationsRef.current = data
      if (data.length > 0) {
        setActiveConversation(data[0])
        activeConversationRef.current = data[0]
        setMessages(data[0].messages)
        getAllAttachmentsInConversation(data[0].messages)
        scrollToBottom();
      }
      // ...
    } catch (error: any) {
      console.error(error)
      toast.error(error)
    }
  }

  async function getConversation(convo: any, isFormNotification = false) {
    console.log(convo)
    console.log("getting conversation");
    var isSeen = false
    var isFriends = false
    if (convo.isSeen) {
      isSeen = true
    } else {
      if (convo.messages.length > 0) {
        if (convo.messages[convo.messages.length - 1].profileid != loggedinUserRef.current.ID) {
          isSeen = true
        }
      } else {
        if (convo.profileid != loggedinUserRef.current.ID) {
          isFriends = true
        }
      }
    }
    if (convo.isfriends) {
      isFriends = true
    }
    if (isFormNotification) {
      isSeen = false
    }

    try {
      var body = {
        ID: convo.ID,
        seen: isSeen,
        isfriends: isFriends
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/getconversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        toast.error('Failed to get conversation. Please try again.')
        // throw new Error('Failed to get conversation. Please try again.')
        return;
      }

      // Handle response if necessary
      const data = await response.json()
      console.log(data)

      var convoIndex = conversationsRef.current.findIndex((convo_: any) => convo_.ID == data.ID);
      var newConvos = conversationsRef.current
      newConvos[convoIndex] = data
      setConversations(newConvos)
      conversationsRef.current = newConvos


      console.log(conversationsRef)

      if (isFormNotification) {
        if (activeConversationRef.current && activeConversationRef.current.ID == data.ID) {
          setActiveConversation(data)
          activeConversationRef.current = data
          setMessages(data.messages)
          getAllAttachmentsInConversation(data.messages)

        } else {
          // conversationsRef.current[convoIndex] = data
          // setConversations(conversationsRef.current)
        }
      } else {
        setActiveConversation(data)
        activeConversationRef.current = data
        setMessages(data.messages)
        getAllAttachmentsInConversation(data.messages)
      }

      scrollToBottom();
      // }
      // ...
    } catch (error: any) {
      console.error(error)
      toast.error(error)
    }
  }

  function selectUser(user: any, convo = null) {
    console.log("user from welcome page", user);

    if (user && user.id == loggedinUser.ID) {
      return
    }

    var convoFound
    if (convo) {
      convoFound = convo
    } else {
      convoFound = conversations.find((convo: any) => convo.profileid == user.id || convo.chatuserid == user.id);
    }

    if (convoFound) {
      console.log("convoFound", convoFound)
      getConversation(convoFound)
    } else {
      setModalData(user)
      setModalIsOpen(true);

      // addConversation(user)
    }
  };

  function handleAddFriend() {
    console.log(modalData)
    closeModal()
    addConversation(modalData)
  }

  async function handleRejectFriend(conv: any) {
    try {
      var body = {
        id: conv.ID
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/deleteconversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        toast.error('Failed to delete conversation. Please try again.')
        return;
      }

      // Handle response if necessary
      const data = await response.json()
      console.log(data)
      getUserConversations(loggedinUser.ID)
      // router.push('/welcome', data.user);
      // ...
    } catch (error: any) {
      // Capture the error message to display to the user
      // setError(error.message)
      console.error(error)
      toast.error(error)
    }
  }

  async function addConversation(user: any) {
    console.log("adding new conversation");
    console.log(loggedinUser);

    try {
      var body = {
        chatuseremail: user.email,
        chatusername: user.username,
        chatuserid: user.id, //loggedin user id
        profileid: loggedinUser.ID,
        username: loggedinUser.username,
        email: loggedinUser.email,
        messages: []
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/addconversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        // throw new Error('Failed to add conversation. Please try again.')
        toast.error('Failed to add conversation. Please try again.')
        return;
      }

      // Handle response if necessary
      const data = await response.json()
      console.log(data)
      getUserConversations(loggedinUser.ID)
      // router.push('/welcome', data.user);
      // ...
    } catch (error: any) {
      // Capture the error message to display to the user
      // setError(error.message)
      console.error(error)
      toast.error(error)
    }
  }

  async function handleSendMessage(event: any) {
    event.preventDefault(); // Prevent default behavior
    console.log(message); // Log the message from state

    if (message.trim() == "" && (!selectedFiles || selectedFiles.length == 0)) {
      return
    }

    setLoading(true);

    try {
      var messageObj = {
        message: message,
        username: loggedinUser.username,
        email: loggedinUser.email,
        profileid: loggedinUser.ID,
        chatid: activeConversation ? activeConversation.ID : "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      }

      // Create FormData object
      const formData = new FormData();

      formData.append("message", JSON.stringify(messageObj));

      // Append selected files to FormData
      selectedFiles.forEach((file, index) => {
        formData.append(`files`, file); // 'files' is the key used to upload multiple files
      });


      formData.forEach((value, key) => {
        console.log(key + " " + value)
      });

      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/message', {
        method: 'POST',
        // headers: {
        //   // 'Content-Type': 'application/json', // Specify the content type as JSON
        //   'Content-Type': 'multipart/form-data',
        // },
        // body: JSON.stringify(messageObj),
        body: formData,
      })

      if (!response.ok) {
        // throw new Error('Failed to add message. Please try again.')
        toast.error('Failed to send message. Please try again.')
        return;
      }

      setSelectedFiles([]);
      setMessage("")
      // Handle response if necessary
      const data = await response.json()
      console.log(data)

      if (activeConversation) {
        activeConversation.messages = [...messages, data]
        setActiveConversation(activeConversation)
        activeConversationRef.current = activeConversation
        setMessages(activeConversation.messages)
        getAllAttachmentsInConversation(activeConversation.messages)
      }

      var convoIndex = conversationsRef.current.findIndex((convo: any) => convo.ID == activeConversationRef.current.ID);
      if (convoIndex != -1) {
        conversationsRef.current[convoIndex] = activeConversationRef.current
        setConversations(conversationsRef.current)

      } else {
        toast.error("Something went wrong!")
      }

      setTimeout(() => {
        scrollToBottom();
      }, 300);
      // messages = messages.append(data.message)
      // setMessages()

    } catch (error: any) {
      // Capture the error message to display to the user
      // setError(error.message)
      console.error(error)
      toast.error(error)
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: any) {
    if (event.key === 'Enter') {
      handleSendMessage(event);
    }
  };

  return (
    <div className="flex flex-col font-[family-name:var(--font-geist-sans)] h-screen w-full" id="main">
      <Header selectUser={selectUser} />

      {loading && (
        <div className='loading-div'>
          <ThreeDot variant="bounce" color="#226699" size="small" text="" textColor="" />
        </div>
      )}


      <div className="flex flex-grow overflow-hidden bg-neutral-800">


        {/*Add friend Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Add Friend Modal"
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <h2>Add {modalData?.username} as your friend?</h2>
          <button onClick={handleAddFriend} className="bg-blue-500 text-white p-2 rounded float-right">Okay</button>
          <button onClick={closeModal} className="bg-gray-500 text-white p-2 rounded float-right mr-4">Close</button>
        </Modal>

        {/* Image Modal */}
        <Modal
          isOpen={isAttachmentModalOpen}
          onRequestClose={closeAttachmentModal}
          contentLabel="View Image"
          className="attachment-modal-content"
          overlayClassName="attachment-modal-overlay"
        >
          <button onClick={closeAttachmentModal} className="absolute top-7 right-7 text-gray-700 hover:text-gray-900">✕</button>
          {modalAttachment && (
            <>
              {isImage(modalAttachment) ? (
                <img src={attachmentUrlsRef.current[modalAttachment]} alt="Enlarged view" className="rounded-lg mx-auto w-full h-auto max-h-[85vh] max-w-[90vw]" />
              ) : isVideo(modalAttachment) ? (
                <video controls className="rounded-lg mx-auto w-full h-auto max-h-[85vh] max-w-[90vw]">
                  <source src={attachmentUrlsRef.current[modalAttachment]} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              // ) : isPDF(modalAttachment) ? (
              ) : (
                <div className="iframe-container">
                  <iframe
                    src={attachmentUrlsRef.current[modalAttachment]}
                    className="w-full h-[80vh] max-w-[90vw] mx-auto"
                    title="iframe Viewer"
                  ></iframe>
                </div>
              // ) : (
              //   <div>Unsupported file type</div>
              )}
            </>
          )}
        </Modal>

        {/* Sidebar */}
        <div className="w-1/3 bg-neutral-200 overflow-y-auto">
          <ul>
            {conversationsRef.current.map((conv) => (
              <li
                key={conv.ID}
                className={`relative p-4 flex cursor-pointer hover:bg-neutral-300 ${activeConversationRef.current?.ID === conv.ID ? 'bg-neutral-400' : ''}`}
                onClick={() => selectUser(null, conv)}
              >
                <div className="flex flex-1 flex-col">
                  <div className="font-bold text-gray-900">
                    {conv.profileid === loggedinUser.ID ? conv.chatusername : conv.username}
                  </div>

                  <div className="flex items-center space-x-2">
                    {conv.messages.length > 0 ? (
                      <span className="text-black text-sm overflow-hidden whitespace-nowrap overflow-ellipsis max-w-xs">
                        {conv.messages[conv.messages.length - 1].message != "" ? (
                          <span className="text-black text-sm overflow-hidden whitespace-nowrap overflow-ellipsis max-w-xs">
                            {conv.messages[conv.messages.length - 1].message}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            *attachment*
                          </span>
                        )}
                      </span>
                    ) : (
                      <div className="flex flex-1 justify-between items-center">
                        {conv.isfriends ? (
                          <span className="text-gray-500 text-sm">start conversation</span>
                        ) : (
                          <>
                            {conv.chatuserid === loggedinUser.ID && !conv.isfriends ? (
                              <>
                                <span className="text-gray-500 text-sm">
                                  sent you a friend request. Click to add.
                                </span>
                                <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRejectFriend(conv);
                                  }}
                                >
                                  {/* Accept */}
                                  Not a friend? Reject
                                </div>

                              </>
                            ) : (
                              <>
                                <span className="text-gray-500 text-sm">
                                  You will be notified once {conv.chatusername} adds you.
                                </span>
                                <div className="bg-blue-400 text-black text-sm px-4 py-2 rounded-full cursor-pointer transition-colors">
                                  Friend request sent
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-gray-600 text-xs">
                    {conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1].timestamp
                      : new Date(conv.UpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>

                {!conv.seen && conv.messages.length > 0 && conv.messages[conv.messages.length - 1].profileid !== loggedinUser.ID && (
                  <span className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                    !
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages && messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.profileid === loggedinUser.ID ? 'text-right' : 'text-left'}`}>




                <div className={`inline-block max-w-full p-2 rounded-lg break-words ${msg.profileid === loggedinUser.ID ? 'messagee-box-bg text-white' : 'bg-gray-300 text-gray-700'}`}>
                  <div className="flex flex-col">
                    {msg.files && msg.files.map((fileName, index_) => (
                      <div key={index_} className="flex justify-start items-center space-x-2">
                        {/* Check if file is an image */}
                        {isImage(fileName) ? (
                          attachmentUrlsRef.current[fileName] ? (
                            <img
                              src={attachmentUrlsRef.current[fileName]} // Use the file URL from state
                              alt={fileName}
                              width={300}
                              className={`rounded-lg`}
                              onClick={() => openAttachmentModal(fileName)}
                            />
                          ) : (
                            <div>Loading image...</div> // Display a loading message while the image URL is being fetched
                          )
                        ) : isAudio(fileName) ? (
                          <div>
                            <button onClick={() => openAttachmentModal(fileName)} className=" top-5 right-5 text-gray-700 hover:text-gray-900">
                              <Image
                                src="https://www.svgrepo.com/show/428363/enlarge.svg"
                                alt="download"
                                width={15}
                                height={15}
                                className="object-contain mr-2"
                              />
                            </button>
                            <audio controls>
                              <source src={attachmentUrlsRef.current[fileName]} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : isVideo(fileName) ? (
                          <div>
                            <button onClick={() => openAttachmentModal(fileName)} className=" top-5 right-5 text-gray-700 hover:text-gray-900">
                              <Image
                                src="https://www.svgrepo.com/show/428363/enlarge.svg"
                                alt="download"
                                width={15}
                                height={15}
                                className="object-contain mr-2"
                              />
                            </button>
                            <video controls>
                              <source src={attachmentUrlsRef.current[fileName]} type="video/mp4" />
                              Your browser does not support the video element.
                            </video>
                          </div>
                        ) : isPDF(fileName) || fileName.endsWith('.txt') || fileName.endsWith('.csv') ? (
                          <div>
                            <button onClick={() => openAttachmentModal(fileName)} className=" top-5 right-5 text-gray-700 hover:text-gray-900">
                              <Image
                                src="https://www.svgrepo.com/show/428363/enlarge.svg"
                                alt="download"
                                width={15}
                                height={15}
                                className="object-contain mr-2"
                              />
                            </button>
                            <iframe
                              src={attachmentUrlsRef.current[fileName]}
                              className="w-full h-full sm:h-[300px] lg:h-[400px]"
                              title="PDF Viewer"
                              onClick={() => openAttachmentModal(fileName)}
                            ></iframe>
                          </div>
                        // ) : fileName.endsWith('.txt') ? (
                        //   <div className="text-file-container p-2 bg-gray-100 rounded-lg max-w-xs overflow-auto">
                        //     <iframe
                        //       src={attachmentUrlsRef.current[fileName]}
                        //       className="w-full h-full sm:h-[300px] lg:h-[400px]"
                        //       title="Text File Viewer"
                        //     ></iframe>
                        //   </div>
                        // ) : fileName.endsWith('.csv') ? (
                        //   <div className="csv-file-container p-2 bg-gray-100 rounded-lg max-w-xs overflow-auto">
                        //     <iframe
                        //       src={attachmentUrlsRef.current[fileName]}
                        //       className="w-full h-32"
                        //       title="CSV File Viewer"
                        //     ></iframe>
                        //   </div>
                        ) : (
                          // <div>Unsupported file type</div> // Handle unsupported file types
                          <div className='flex flex-row truncate overflow-hidden whitespace-nowrap'>
                            <a
                              href={attachmentUrlsRef.current[fileName]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="document-link"
                            >
                              <Image
                                src="https://www.svgrepo.com/show/485158/file.svg"
                                alt="attachment"
                                width={70}
                                height={70}
                                className="object-contain mr-2"
                              />
                              {/* Download Document */}
                            </a>
                            <div className='flex flex-col ml-auto'>
                              {fileName}
                              <Image
                                src="https://www.svgrepo.com/show/485514/download-1.svg"
                                alt="download"
                                width={30}
                                height={30}
                                className="object-contain mr-2 download-btn"
                              />
                            </div>
                          </div>

                        )}
                      </div>
                    ))}
                  </div>
                  {msg.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>







          {/* Attachment Preview Balloon */}
          {selectedFiles.length > 0 && (
            <div className="absolute bottom-20 right-4 bg-gray-100 shadow-lg rounded-md p-4 w-1/8 max-h-60 overflow-y-auto border border-gray-300">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Preview</h4>
                <button
                  onClick={clearAllAttachments}
                  className="text-gray-500 hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
              <ul className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                  >
                    {/* Show a thumbnail for images, otherwise show the file name */}
                    {file.type.startsWith('image/') ? (
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="attachment preview"
                        width={70}
                        height={70}
                        className="object-cover rounded mr-2"
                      />

                    ) : (
                      <div className="flex items-center w-full">
                        <Image
                          src="https://www.svgrepo.com/show/485158/file.svg"
                          alt="attachment"
                          width={40}
                          height={40}
                          className="object-contain mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="text-gray-700 truncate overflow-hidden whitespace-nowrap w-32">
                            {file.name}
                          </span>
                          <span className="text-gray-500 text-xs truncate overflow-hidden whitespace-nowrap w-32">
                            {file.type || "Unknown type"}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedFiles.length > 1 && (
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}


          {/* Input */}
          <div className="p-4 border-t bg-white flex items-center">

            {/* File Upload Button */}
            <input
              type="file"
              accept="*/*"
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
              ref={fileInputRef}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 mr-2 bg-gray-200 rounded-full hover:bg-gray-300"
              disabled={!activeConversation || (messages.length === 0 && !activeConversation.isfriends)}
            >
              <Image
                src="https://www.svgrepo.com/show/405380/file-folder.svg"
                alt="attachment"
                width={24}
                height={24}
                className="object-contain"
                // onClick={() => {
                //   if (activeConversation && (messages.length > 0 || activeConversation.isfriends)) {
                //     // Perform the intended action here
                //   }
                // }}
                style={{
                  opacity: !activeConversation || (messages.length === 0 && !activeConversation.isfriends) ? 0.5 : 1,
                }}
              />
            </button>

            {/* Message Textarea */}
            <textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border text-black rounded-lg focus:outline-none focus:border-blue-500"
              rows={1}
              disabled={!activeConversation || (messages.length === 0 && !activeConversation.isfriends)}
            />

            {/* Send Button */}
            <button
              type="button"
              className={`ml-2 h-full px-4 py-2 rounded-lg focus:outline-none ${!activeConversation ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={handleSendMessage}
              disabled={!activeConversation || (messages.length === 0 && !activeConversation.isfriends)}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
