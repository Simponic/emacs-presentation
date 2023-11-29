import { useRef, useState, useEffect } from "react";
import { generateGruvboxFromString } from "./utils/generate_gruvbox";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [posts, setPosts] = useState([]);
  const postsRef = useRef([]);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [color, setColor] = useState("");

  const scrollToBottomOfChat = () => {
    const objDiv = document.getElementById("chat");
    objDiv.scrollTop = objDiv.scrollHeight;
  };

  useEffect(() => {
    const protocol = document.location.protocol === "https:" ? "wss:" : "ws:";
    let socket;

    fetch("/posts")
      .then((r) => r.json())
      .then((msgs) => {
        postsRef.current = msgs;
        setPosts(postsRef.current);
        scrollToBottomOfChat();
      })
      .then(() => {
        socket = new WebSocket(`${protocol}//${document.location.host}/`);
        socket.addEventListener("open", () => {
          socket.send("ping");
        });
        socket.addEventListener("message", (msg) => {
          const { data } = msg;
          if (data === "pong") return;

          const chat = JSON.parse(msg.data);
          if (chat.author) {
            postsRef.current = [...postsRef.current, chat];
            setPosts(postsRef.current);
            scrollToBottomOfChat();
          }
        });

        setSocket(socket);
      });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    setColor(generateGruvboxFromString(username));
  }, [username]);

  const addPost = () => {
    setError("");
    if (socket) {
      fetch("/posts", {
        method: "POST",
        headers: { Content: "application/json" },
        body: JSON.stringify({ author: username, message: content }),
      }).then(() => setContent(""));
    }
  };

  return (
    <div className="container" style={{ border: `1px solid ${color}` }}>
      <div style={{ textAlign: "center" }}>
        <h2>TronglePosting in ELisp</h2>
      </div>
      <div id="chat" className="chat">
        <p>Welcome!</p>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              lineBreak: "normal",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ color: generateGruvboxFromString(post.author) }}>
                {post.author}:{" "}
              </span>
              <span>{post.message}</span>
            </div>
            <div style={{ fontSize: "x-small" }}>
              [{new Date(post.date).toLocaleString()}]
            </div>
          </div>
        ))}
      </div>
      <div>
        <input
          placeholder={"Username"}
          className="input"
          style={{ color }}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          value={username}
        ></input>
        <textarea
          placeholder={"Message"}
          className="input"
          onChange={(e) => setContent(e.target.value)}
          value={content}
          rows={1}
          cols={50}
        ></textarea>
        <div className="button" onClick={addPost}>
          Post
        </div>
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
      </div>
    </div>
  );
}

export default App;
