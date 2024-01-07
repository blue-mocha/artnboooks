import React, {useState, useEffect} from 'react'; 
import axios from "axios";
import {Link, useNavigate, useParams} from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


function ReviewEdit() { 
  const {id} = useParams(); 
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;
 
  //state
  const [file, setFiles] = useState(null); 
  const [text, setText] = useState(null); 
  const [attachment, setAttachment] = useState(null); 
  const [inputs, setInputs] = useState({  
    title: '',
    category :'', 
  });  

  console.log(inputs, text, attachment)
 
  useEffect(async () => {
    const response = await axios.get(`${URL}/review/post/${id}`)
    setInputs(response.data);
    setText(response.data.text);
    setAttachment(response.data.attachment);
    }, []); 

  const {title, category} = inputs; 

  const onChange = (e) => { 
    const { name, value }  = e.target;

    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const Update = async () => {

    if (window.confirm('수정하시겠습니까?') === true){

      const formData = new FormData();

        formData.append('title', title);
        formData.append('text', text); 
        formData.append('category', category); 

          if(attachment !== null){
            formData.append('attachment', attachment);} 
          if(file !== null){
            formData.append('newAttachment', file);
          } 
       
     const response = await axios.put(
       `${URL}/review/update/${id}`,
        formData,
       { withCredentials: true }); 
         
    }
   };

   const Delete=()=>{
    setAttachment(null); 
   }

   const handleUpload = (e) => {
    e.preventDefault();
    setFiles(e.target.files[0]);
  };

  function uploadAdapter(loader) {

    const API_URL = URL;  
    const UPLOAD_ENDPOINT = "review/upload-s3";  

    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          const body = new FormData();
          loader.file.then((file) => {
            body.append("imgFile", file);
            fetch(`${API_URL}/${UPLOAD_ENDPOINT}`, {
              method: "post",
              body: body
            })
              .then((res) => res.json())
              .then((res) => {
                resolve({
                  default: `${res.location}`
                });
              })
              .catch((err) => {
                reject(err);
              });
          });
        });
      }
    };
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return uploadAdapter(loader);
    };
  }

    return (
      <div>
        <h1>[게시글 수정]</h1>
       
        <form enctype="multipart/form-data" action ={`/reviewlist/${id}`} onSubmit ={Update}>  

          <select onChange={onChange} value={category} name ="category">
            <option value="서평">서평</option>
            <option value="공연">공연</option>
            <option value="전시">전시</option>
          </select><br/>

          제목 : <input name="title" onChange={onChange} value={title}/><br/>
          
          <CKEditor 
              editor={ClassicEditor}
              data={text}
             
              config={{
                extraPlugins: [uploadPlugin]
              }}

              onChange={(event, editor) => {
                const text = editor.getData();
                setText(text); 
              }}
              onBlur={(event, editor) => {
                //console.log('Blur.', editor);
              }}
              onFocus={(event, editor) => {
               // console.log('Focus.', editor);
              }}
            />
          

          첨부파일 : {attachment?.originalFileName} 
          
         {attachment && !inputs.attachment.isDeleted?
           (<button onClick={Delete}>삭제</button>) : 
           (<input name="file" type ="file" accept="image/*" onChange={handleUpload}/>)
          }<br/>

          <input type='submit' value='수정하기'/> 
          <button><Link to={`/reviewlist/${id}`}>취소</Link></button>
        </form>  

      
       
      </div>
    );
  }
  
  export default ReviewEdit;