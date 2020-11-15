/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GrinBridge, NSObject)

RCT_EXTERN_METHOD(setLogger:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletPmmrRange:(NSString*)state resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(balance:(NSString*)state refreshFromNode:(BOOL)refreshFromNode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txsGet:(NSString*)state refreshFromNode:(BOOL)refreshFromNode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txGet:(NSString*)state refreshFromNode:(BOOL)refreshFromNode txSlateId:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txPost:(NSString*)state txSlateId:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCreate:(NSString*)state amount:(int64_t)amount selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll  resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txSendHttps:(NSString*)state amount:(int64_t)amount selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll url:(NSString*)url resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txSendAddress:(NSString*)state amount:(int64_t)amount selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll address:(NSString*)address resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txStrategies:(NSString*)state amount:(int64_t)amount resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCancel:(NSString*)state id:(NSUInteger)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txReceive:(NSString*)state slatepack:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txFinalize:(NSString*)state slatepack:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(seedNew:(NSUInteger)seedLength resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletPhrase:(NSString*)state resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletInit:(NSString*)state phrase:(NSString*)phrase password:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletScanOutputs:(NSString*)state lastRetrievedIndex:(int64_t)lastRetrievedIndex highestIndex:(int64_t)highestIndex resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkPassword:(NSString*)state password:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(slatepackDecode:(NSString*)state slatepack:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startListenWithHttp:(NSString*)state resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopListenWithHttp:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
