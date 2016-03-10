<?php
define('APIKEY', '9ed4efc320174f3e89ba157849a32923');
define('URI','https://api.despegar.com/v3/');

$method = $_POST["method"];
$qs     = $_POST["qs"];
$body   = $_POST["body"];
$patch  = $_POST["patch"];
$uri    = URI.$method.$qs;
$ch     = curl_init($uri);

if($patch) {
  curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PATCH");
}

curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'X-ApiKey: '.APIKEY, 'Accept: application/json') );

if($body) {
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
}

$out = curl_exec($ch);

curl_close($ch);

json_encode($out);
?>
