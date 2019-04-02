// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(GrinBridge, RCTEventEmitter)

RCT_EXTERN_METHOD(balance:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr refreshFromNode:(BOOL)refreshFromNode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txsGet:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr refreshFromNode:(BOOL)refreshFromNode resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txGet:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr refreshFromNode:(BOOL)refreshFromNode txSlateId:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txPost:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr txSlateId:(NSString*)txSlateId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCreate:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr amount:(int64_t)amount selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll message:(NSString*)message  resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txSendHttps:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr amount:(int64_t)amount selectionStrategyIsUseAll:(BOOL)selectionStrategyIsUseAll message:(NSString*)message url:(NSString*)url resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txStrategies:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr amount:(int64_t)amount resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txCancel:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr id:(NSUInteger)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txReceive:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr slatePath:(NSString*)slatePath message:(NSString*)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(txFinalize:(NSString*)account password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr slatePath:(NSString*)slatePath resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(seedNew:(NSUInteger)seedLength resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletPhrase:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(walletInit:(NSString*)phrase password:(NSString*)password checkNodeApiHttpAddr:(NSString*)checkNodeApiHttpAddr isNew:(BOOL)isNew resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkPassword:(NSString*)password resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end
