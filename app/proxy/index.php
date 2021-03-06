<?php
define('APIKEY', '9ed4efc320174f3e89ba157849a32923');
define('URI','https://api.despegar.com/v3/');


$method = $_POST["method"];
$qs     = $_POST["qs"];
$body   = isset($_POST["body"])?$_POST["body"]:false;
$patch  = isset($_POST["patch"])?$_POST["patch"]:false;
$uri    = URI.$method.$qs;
$ch     = curl_init($uri);

if($method=='hotels/bookings'){
	$body["reservation_context"]["user_agent"] = $_SERVER["HTTP_USER_AGENT"];
	$body["reservation_context"]["client_ip"] = $_SERVER["REMOTE_ADDR"];
	$body["reservation_context"]["base_url"] = $_SERVER["HTTP_HOST"];
}

if($patch) {
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");
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
