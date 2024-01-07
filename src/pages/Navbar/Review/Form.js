import React, {useState, useEffect} from 'react'; 
import axios from "axios";
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


function ReviewForm() {
  const URL = process.env.REACT_APP_SERVER_URL;
  const location = useLocation(); 
  const navigate = useNavigate();

  const [book, setBook] = useState(null); 
  const [attachment, setFiles] = useState(null); 
  const [text, setText] = useState(null);
  const [inputs, setInputs] = useState({
    title: '',
    category : '서평'
  }); 

  
 useEffect(async () => { // 전달받은 책정보(서평쓰기)
    if(location?.state !== null){
      
      const title =(JSON.parse(location.state.data).title)
      .replace(/(<b>|<\/b>)/gi, "").replace(/&gt;/g,"").replace(/&lt;/g,"")
    
      setInputs({
      ...inputs, 
      title : title
      });
     
      setBook(JSON.parse(location.state.data)); 
    }
  }, []);  


  const {title, category} = inputs; 

  const onChange = (e) => { 
    const { name, value }  = e.target;
    
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const handleUpload = (e) => {
   e.preventDefault();
   setFiles(e.target.files[0]);
  };
 

  //글작성 전송 
  const onSubmit = async (e)=> {
     e.preventDefault();
     
    if(inputs.title ==='' || text === null){ 

         alert('내용을 입력하세요.');

      }else{
        const formData = new FormData();
        formData.append('title', title);
        formData.append('text', text);
        formData.append('category', category);
        
        if(attachment!== null){
        formData.append('attachment', attachment);
        }
    
        const res = await axios.post(`${URL}/review`, formData, 
        { withCredentials: true }); 
          
         if(res.status == 200){
         navigate(`/reviewlist/${res.data}`); 
         }
       
      }      
    } 
   
  //이미지 업로드
    function uploadAdapter(loader) {

      const API_URL = URL; //server URL
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
                .then((res) => res.json()) //파일객체 받음.
                .then((res) => {
                  resolve({
                    default: `${res.url}`//결과값 : 이미지경로
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
      <div className= "review_form" >          
        <div className= "form_container" >
          <h1>후기등록하기</h1>
          <form enctype="multipart/form-data" onSubmit={onSubmit}>
          
          <select onChange={onChange} name ="category">
            <option value="서평">서평</option>
            <option value="공연">공연</option>
            <option value="전시">전시</option>
          </select>
            
          <b> 제목</b> : 
          <input name="title" onChange={onChange} value={title}/><br/>
                    
          <div>
          <CKEditor 
            editor={ClassicEditor} 

            onReady={(ClassicEditor) => {
              ClassicEditor.editing.view.change((writer) => {
              writer.setStyle(
                  "height",
                  "300px",
                  ClassicEditor.editing.view.document.getRoot()
              );
              });
            }} 
            
            data={book &&
                `<img src =${book.image}/><br/>
                저자 : ${book.author} <br/>
                출판사 : ${book.publisher}`
                }
            
            config={{
              extraPlugins: [uploadPlugin] //이미지 올리기
            }}

            onChange={(event, editor) => {
            const text = editor.getData();
            setText(text); 
            }}

            onBlur={(event, editor) => {
            //console.log('Blur.', editor);
            }}//객체가 포커스를 잃었을 때
            //(e.g. by clicking outside it or pressing the TAB key).

            onFocus={(event, editor) => {
            //console.log('Focus.', editor);
            }}
           />
           </div>  

            <input name="file" type ="file" onChange={handleUpload}/>
            <p/>       

            <input type='submit' value='등록하기'/>  
            <button><Link to="/Reviewlist">취소</Link></button>   

          </form>              
        </div>
         
      </div>
    );
  }
  
  export default ReviewForm; 