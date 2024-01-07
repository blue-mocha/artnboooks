const mongoose = require('mongoose');
const fs = require('fs'); //file system in node.js 
const path = require('path'); //path 조작.


// schema 
const fileSchema = mongoose.Schema({ 
  originalFileName:{type:String},
  serverFileId:{type:String}, // box api files 
  serverFileName:{type:String},
  size:{type:Number},
  uploadedBy:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  postId:{type:mongoose.Schema.Types.ObjectId, ref:'Review'},
  //isDeleted:{type:Boolean, default:false}, 
});


// processDelete
fileSchema.methods.processDelete = function(){ 
  this.isDeleted = true;
  this.save();
};


//getFileStream(path)
fileSchema.methods.getFileStream = async function(){

    var stream;
    var filePath = path.join(__dirname,'..','uploadedFiles',this.serverFileName);
    var fileExists = fs.existsSync(filePath);
    if(fileExists){
        stream = fs.createReadStream(filePath);
    }
    else {
        this.processDelete();
    }
    return stream;

    }


// model & export
const File = mongoose.model('File', fileSchema);


// methods
File.createNewInstance = async function(file, uploadedBy, postId){
 
    return await File.create({
        originalFileName:file.originalname,
        serverFileName:file.filename,
        size:file.size,
        uploadedBy:uploadedBy,
        postId:postId,
      });
  }

module.exports = File;