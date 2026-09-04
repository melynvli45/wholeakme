<?php
// Prototype endpoint for the browser extension. No API key is required.
header('Content-Type: application/json'); header('Access-Control-Allow-Origin: *');
require_once __DIR__.'/../includes/db.php'; require_once __DIR__.'/../includes/functions.php';
$in=json_decode(file_get_contents('php://input'),true)?:[];$url=$in['url']??'';$userId=$in['user_id']??'';
if(!$url){http_response_code(400);echo json_encode(['ok'=>false,'message'=>'Missing URL']);exit;}
$items=mockScan('url',$url);$max=0;foreach($items as $i)$max=max($max,severityScore($i['risk']));
echo json_encode(['ok'=>true,'risk_score'=>$max,'risk_level'=>riskLabel($max),'findings'=>$items,'note'=>'Prototype local heuristic result; no external OSINT API queried.']);
?>
