<?php
define('APIKEY', '9ed4efc320174f3e89ba157849a32923');
define('URI','https://api.despegar.com/v3/');

$method = $_POST["method"];
$qs     = $_POST["qs"];
$uri    = URI.$method.$qs;
$ch     = curl_init($uri);

curl_setopt_array($ch, array(
  CURLOPT_HTTPHEADER  => array('X-ApiKey: '.APIKEY, 'Accept: application/json')
));

$out = curl_exec($ch);

curl_close($ch);

json_encode($out);
?>
