$(document).ready(()=>{

// evnt handle for the save articel save button

    $(".save").on("click", ()=> {
        var newSavedArticle = $(this).data();
        newSavedArticle.saved = true;
        console.log("saved was clicked");
        var id = $(this).attr("data-articleid");
        $.ajax("/saved/" + id, {
          type: "PUT",
          data: newSavedArticle
        }).then((data)=> {
            location.reload();
          }
        );
      });
// event handle for the remove fom saved articel
      $(".remove-btn").on("click", ()=> {
        var newUnsavedArticle = $(this).data();
        var id = $(this).attr("data-articleid");
        newUnsavedArticle.saved = false;
        $.ajax("/saved/" + id, {
          type: "PUT",
          data: newUnsavedArticle
        }).then((data)=> {
            location.reload();
          }
        );
      }); 
});
    



