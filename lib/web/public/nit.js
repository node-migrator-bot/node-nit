'use strict';

function openTask (taskId) {
  document.location.href = "/tasks/" + taskId;
}

function selectOption (fieldName, valueToSelect) {
  $("select[name='" + fieldName + "']").val(valueToSelect);
}
