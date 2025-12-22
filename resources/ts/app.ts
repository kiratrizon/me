import $ from "jquery";

$(document).ready(function () {
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    const form = $(this);
    const messageEl = $("#formMessage");

    // Gather form data
    const data = {
      name: form.find("input[name='name']").val(),
      email: form.find("input[name='email']").val(),
      message: form.find("textarea[name='message']").val(),
    };

    $.ajax({
      url: "/api/send-mail",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      dataType: "json",
      success: function (res) {
        if (res.success) {
          messageEl
            .text("Your message has been sent!")
            .removeClass("hidden text-red-500")
            .addClass("text-green-500");
          form.trigger("reset");
        } else {
          messageEl
            .text("Failed to send message. Please try again.")
            .removeClass("hidden text-green-500")
            .addClass("text-red-500");
        }
      },
      error: function () {
        messageEl
          .text("An error occurred. Please try again later.")
          .removeClass("hidden text-green-500")
          .addClass("text-red-500");
      },
    });
  });
});
