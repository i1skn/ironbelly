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


import Foundation

extension String {
    static func fromStringPtr(ptr: rust_string_ptr) -> String {
        let data = NSData(bytes: UnsafeRawPointer(ptr.ptr), length: ptr.len)
        return String(data: data as Data, encoding: String.Encoding.utf8)!
    }
    
    func asPtr() -> rust_string_ptr {
        let data = self.data(using: String.Encoding.utf8, allowLossyConversion: false)!
        return rust_string_ptr(ptr: (data as NSData).bytes.bindMemory(to: UInt8.self, capacity: data.count), len: data.count)
    }
}
