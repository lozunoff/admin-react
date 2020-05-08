<?php
session_start();

if ($_SESSION['auth'] != true) {
    header("HTTP/1.0 403 Forbidden");
    die;
}

$file = "../../ughn_fj648jfoo.html";

if (file_exists($file)) {
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");
}
