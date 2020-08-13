$( document ).ready(function() {
  var items = [];
  var itemsRaw = [];

  const updateItems = ({bookId, newBook}) => {
    if(newBook) itemsRaw.push(newBook);
    if(bookId) itemsRaw = itemsRaw.filter(obj => obj._id != bookId);
    items = [];
    $.each(itemsRaw, function(i, val) {
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return ( i !== 14 );
    });
    if (items.length >= 15) {
      items.push('<p>...and '+ (itemsRaw.length - 15)+' more!</p>');
    }
  };

  const displayList = ({bookId, newBook}) => {
    emptyList();
    updateItems({bookId, newBook});
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
      }).appendTo('#display');
  }

  const emptyList = () => {
    $('#display').html("");
    $('#bookDetail').html(`<p id='detailTitle'>Select a book to see it's details and comments</p>
    <ol id='detailComments'></ol>`)
  }
  
  $.getJSON('/api/books', function(data) {
    itemsRaw = data;
    displayList({});
  });
  
  var comments = [];
  $('#display').on('click','li.bookItem',function() {
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
      comments = [];
      $.each(data.comments, function(i, val) {
        comments.push('<li>' +val+ '</li>');
      });
      comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></form>');
      comments.push('<br><button class="btn btn-info addComment" id="'+ data._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
    });
  });
  
  $('#bookDetail').on('click','button.deleteBook',function() {
    const bookId = this.id;
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        displayList({bookId});
        $('#detailComments').html('<p class="success">'+data+'<p><p>Refresh the page</p>');
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function() {
    var newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.unshift(newComment); //adds new comment to top of list
        $('#detailComments').html(comments.join(''));
      }
    });
  });
  
  $('#newBook').click(function(e) {
    e.preventDefault();
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        displayList({newBook: data});
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'text',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        if(data === "Something went wrong! The books couldn't be deleted") {
          $('<p/>', {
            'class': 'error',
            html: data
            }).appendTo('#sampleui');
        } else {
          $('<p/>', {
            'class': 'success',
            html: data
            }).appendTo('#sampleui');
          emptyList();
          items = [];
          itemsRaw = [];
        }
      }
    });
  }); 
  
});