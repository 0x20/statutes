function listFolderContents(folderId) {
  var files = new Array();

  var folder = DriveApp.getFolderById(folderId);
  var contents = folder.getFiles();
  while(contents.hasNext()) {
    files.push(contents.next());
  }
  return files;
}


// uncomment code for a HTML list.
function doGet() {
  var folderId = '0B_ctQ4b8yQ9fUTEtQnRGZmQ5aDQ';
  var btwNr = '825041616';
  var url = 'http://www.ejustice.just.fgov.be/cgi_tsv/tsv_l_1.pl?lang=nl&sql=btw+contains+%27'+btwNr+'%27&fromtab=TSV';
  
  var storedFiles = listFolderContents(folderId).join("|"); //WHY? Because index off is fucked in Arrays but not Strings :/
  
  var html = UrlFetchApp.fetch(url).getContentText();
  html = html.replace(/> BEELD/g, 'href=');
  var parts = html.split("href=");
  //var output = "";
  for(var i = 1; i < parts.length; i += 2) {
    //output += "<a target='_blank' href='http://www.ejustice.just.fgov.be" + parts[i] + "'>Published " + parts[i].substring(9, 19) + "</a>\n<br />";
    var filename = parts[i].substring(9).replace(/\//g, '-');
    if((storedFiles.indexOf(filename) < 0)){
      var fileId = uploadFile('http://www.ejustice.just.fgov.be' + parts[i], filename);
      moveFileToAnotherFolder(fileId, folderId);    
    }

  }
  //return HtmlService.createHtmlOutput(output);
}


function uploadFile(url, name) {
  Logger.log("downloading %s", name);
  var file = UrlFetchApp.fetch(url).getBlob();
  var meta = {
    title: name,
    name: name,
    mimeType: 'application/pdf'
  };
  var uploaded = Drive.Files.insert(meta, file);
  return uploaded.id;
}


// Move file to another Google Drive Folder
// https://ctrlq.org/code/20201-move-file-to-another-folder

function moveFileToAnotherFolder(fileID, targetFolderID) {

  var file = DriveApp.getFileById(fileID);
  
  // Remove the file from all parent folders
  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    parent.removeFile(file);
  }
  DriveApp.getFolderById(targetFolderID).addFile(file);
}
