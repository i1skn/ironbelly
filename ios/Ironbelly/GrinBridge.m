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

RCT_EXTERN_METHOD(walletInit:(NSString*)config phrase:(NSString*)phrase password:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(openWallet:(NSString*)config password:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(closeWallet:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startTor:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopTor:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletPmmrRange:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txsGet:(int64_t)minimumConfirmations refreshFromNode:(BOOL)refreshFromNode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txGet:(BOOL)refreshFromNode txSlateId:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txPost:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCreate:(int64_t)amount minimumConfirmations:(int64_t)minimumConfirmations selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txSendAddress:(int64_t)amount minimumConfirmations:(int64_t)minimumConfirmations selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll address:(NSString*)address resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txStrategies:(int64_t)amount minimumConfirmations:(int64_t)minimumConfirmations resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCancel:(NSUInteger)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txReceive:(NSString*)account slatepack:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txFinalize:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(seedNew:(NSUInteger)seedLength resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletPhrase:(NSString*)walletDir password:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletScanOutputs:(int64_t)lastRetrievedIndex highestIndex:(int64_t)highestIndex resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(slatepackDecode:(NSString*)slatepack resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startListenWithHttp:(NSString*)apiListenAddress resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopListenWithHttp:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

@end
