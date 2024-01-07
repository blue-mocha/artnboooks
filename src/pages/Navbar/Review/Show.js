import React, { useState, useEffect } from 'react';
import axios from "axios";
import { isLogin, Login_info } from 'utils/isLogin';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver';
import ReactHtmlParser from "react-html-parser";
import LikedButton from 'components/common/LikedButton';
import 'styles/pages/review.scss';


function ReviewShow() {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;

  //this post
  const [post, setPost] = useState([]);
  //comments 
  const [Comments, setComments] = useState([]);
  const [input, setInput] = useState('');

  const { id } = useParams();

  /*-----------------------------------------------------------------*/
  useEffect(async () => {
    const response_post = await axios.get(`${URL}/review/post/${id}`)
    setPost(response_post.data);

    const response_comment = await axios.get(`${URL}/comment/find/${id}`)
    setComments(response_comment.data);

    window.scrollTo(0, 0)
  }, [id]);

  //file 다운로드 ----------------------------------------------------//   
  async function fileDownload() {
    const url = `${URL}/file/${post.attachment.serverFileName}/${post.attachment.originalFileName}`;
    const res = await axios.get(url, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/octet-stream' }
    })
    const file = new Blob([res.data], { type: 'image/*' })
    saveAs(file, file.fileName);
  };

  //파일삭제
  async function fileDelete() {
    if (window.confirm('첨부파일을 삭제하시겠습니까?') === true) {
      const res_deletedFile = await axios.post(`${URL}/file/delete`, {
        _id: id,
        file_name: post.attachment.serverFileName
      });
      if (res_deletedFile.status == 200) {
        navigate(0);
      }
    }
  };

  //글삭제 ----------------------------------------------------------// 
  const Delete = async () => {
    if (window.confirm('삭제하시겠습니까?') === true) {
      const response = await axios.delete(`${URL}/review/delete/${id}`);
      alert(response.data);
      //navigate(`/review_reload`);
      window.location.assign('/reviewlist')
    }
  };

  //댓글전송 ---------------------------------------------------------// 
  const commentSubmit = async () => {
    const response = await axios.post(`${URL}/comment`,
      {
        postId: id,
        text: input
      }, { withCredentials: true })
    if (response.data == 200) {
      navigate(0);
    }
  }

  //댓글삭제
  const comment_del = async (e) => {
    if (window.confirm('삭제하시겠습니까?') === true) {
      const comment_del = await axios.delete(`${URL}/comment/delete/${e.target.value}`);
      navigate(0);
    }
  }

  //------------------------------------------------------------------//
  return (
    <div className="show_container">
      <div className="review_show">
        <table>

          <tr>
            <th id="title" colSpan='3'>{`[${post.category}]`}{post.title}</th>
          </tr>

          <tr>
            <td width="70%"><b>작성자</b>: {post.author?.userId}</td>
            <td>{post.saveDate}</td>
            <td>조회수 : {post.views}</td>
          </tr>


          {post.attachment &&
            <tr>
              <td colSpan='3'>
                <span><b>첨부파일</b> :</span>
                <span>
                  {isLogin() && Login_info() === post.author?.userId &&
                    <button onClick={fileDelete}><b>X</b></button>}
                  <button onClick={fileDownload}>{post.attachment.originalFileName}</button>

                </span>
              </td>
            </tr>
          }

          <tr>
            <td colSpan='3' id="review_content">
              {ReactHtmlParser(post.text)}
            </td>
          </tr>


          {
            Comments.length > 0 && Comments.map((comment) => (
              <tr key={comment._id}>
                <td colSpan='3'>
                  <span><b>{comment.author?.userId}</b></span> :
                  <span>{comment.text}</span>
                  <p>{comment.saveDate}
                    {isLogin() && Login_info() === comment.author?.userId &&
                      <>
                        <button onClick={comment_del} value={comment._id}>댓글삭제</button><br />
                      </>
                    }

                  </p>
                </td>
              </tr>
            ))
          }

        </table>

        <div className="bottom">
          <LikedButton id={id} URL={URL} />

          {isLogin() && Login_info() === post.author?.userId &&

            <div id="bottom_box">
              <button onClick={Delete}>글삭제</button>
              <Link to={`/reviewEdit/${id}`}><button>수정</button></Link>

            </div>
          }

          {isLogin() &&
            <div id="comment_add">
              <h3>+comment</h3>
              <textarea onChange={(e) => setInput(e.target.value)} rows='6' ></textarea><br />
              <button onClick={commentSubmit}>댓글 전송</button><p />
            </div>
          }

        </div>
      </div>
    </div>
  );
}

export default ReviewShow;