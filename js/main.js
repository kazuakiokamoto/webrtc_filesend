
/*
Data Channelの参考資料

・これでログインする
　http://qiita.com/n0bisuke/items/c17a809084eda74a0474
or
・自分でIDを入力させる


http://www.html5rocks.com/ja/tutorials/webrtc/datachannels/
http://blog.wnotes.net/blog/article/beginning-webrtc-datachannel
http://www.slideshare.net/yoshiakisugimoto9/webrtc-slide



*/

$(function(){

  // APIキー
  var apiKey = '0dd40461-590e-4634-9c2b-16622174a552';

  // peer用オブジェクト
  var peer = null;

  // ファイル管理オブジェクト
  var sendFiles = [];

  // 接続
  $("#rtcConnect").on("click", function(){
    var connectID = $("#connectID").val();
    if(!connectID){
      alert("接続IDを入力してください");
      return;
    }
    if(peer!==null){
      alert("既に接続済みです");
      return;
    }
    peer = new Peer(connectID , {key: apiKey});
    // エラー
    peer.on('error', function(err) {
      alert("エラー: IDが重複しているかもしれません");
      return;
    });
    // 接続完了
    peer.on('open', function(id) {
      $("#myid").text(id);
      $("#connectID").val("");
    });
    // 他から接続された場合
    peer.on('connection', fileget);
    /*
    peer.on('connection', function(conn){
      conn.on('data', fileget);
    });
    */
  });

  // データ受信
  var fileget = function(c){
    if(c.label === 'file') {
      c.on('data', function(data){
        if (data[0].constructor === ArrayBuffer) {
          var dataView = new Uint8Array(data[0]);
          var dataBlob = new Blob([dataView]);
          var url = window.URL.createObjectURL(dataBlob);
          $("#getDataArea").append('<li><a target="_blank" download="' + data[1] + '" href="' + url + '">from ' + c.peer + ' : ' + data[1] + '</a></li>');
        }
      });
    }
  };


  // 切断
  $("#rtcDisconnect").on("click", function(){
    if(peer!==null){
      peer.disconnect();
      $("#myid").text("まだ接続していません");
      peer=null;
    }
  });

  // ファイル送信
  $("#p2pConnect").on("click", function(){
    if(peer===null){
      alert("P2P通信を開始できません。IDを取得済みか確認してください");
      return;
    }
    if(!sendFiles.length){
      alert("送信するファイルが選択されていません");
      return;
    }
    var connectPeerId = $("#p2pConnectId").val();
    var conn = peer.connect(connectPeerId, {label: 'file'});
    conn.on('open', function() {
      for(var i=0,l=sendFiles.length;i<l;i++){
        var filename = sendFiles[i].name;
        conn.send([sendFiles[i], filename]);
      }
      //alert("ファイルを送信しました");
      sendFiles = [];
      $("#fileList").html("");
      //conn.close();
    });
  });

  // ファイル情報更新
  var fileinfoUpadate = function(){
    var filesHtml = '';
    $.each(sendFiles, function(i, file){
      filesHtml += '<li>' + file.name + ' : ' + file.type + ' : ' + file.size + '</li>';
    });
    $("#fileList").html(filesHtml);
  };

  // ファイル選択
	var onSelectFile = function(e){
		var files = e.target.files;
		for (var i=0; i<files.length; ++i) {
      sendFiles.push(files[i]);
		}
    fileinfoUpadate();
	};

	// ファイルドロップ
	var onDropFile = function(e){
    e.stopPropagation();
		e.preventDefault();
		var files = e.originalEvent.dataTransfer.files;
		for (var i=0; i<files.length; ++i) {
      sendFiles.push(files[i]);
		}
    fileinfoUpadate();
	};

	// キャンセルイベント
	var cancelEvent = function(e){
		if (e.preventDefault) { e.preventDefault(); }
		return false;
	};

	// events
  $("#dropFiles").on("dragover dragenter", cancelEvent);
  $("#dropFiles").on("drop", onDropFile);
  $("#selectFiles").on("change", onSelectFile);
});
