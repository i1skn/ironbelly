//
//  Utils.swift
//  Ironbelly
//
//  Created by Ivan Sorokin on 06.11.20.
//  Copyright © 2020 Ivan Sorokin. All rights reserved.
//

import Foundation

func returnToReact(error: UInt8, cResult: UnsafePointer<Int8>, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {

    let result = String(cString: cResult)
    if error == 0 {
        resolve(result)
    } else {
        reject(nil, result, nil)
    }
    cstr_free(UnsafeMutablePointer(mutating: cResult))
}

extension NSPointerArray {
    func addObject(_ object: AnyObject?) {
        guard let strongObject = object else { return }

        let pointer = Unmanaged.passUnretained(strongObject).toOpaque()
        addPointer(pointer)
    }

    func insertObject(_ object: AnyObject?, at index: Int) {
        guard index < count, let strongObject = object else { return }

        let pointer = Unmanaged.passUnretained(strongObject).toOpaque()
        insertPointer(pointer, at: index)
    }

    func replaceObject(at index: Int, withObject object: AnyObject?) {
        guard index < count, let strongObject = object else { return }

        let pointer = Unmanaged.passUnretained(strongObject).toOpaque()
        replacePointer(at: index, withPointer: pointer)
    }

    func object(at index: Int) -> AnyObject? {
        guard index < count, let pointer = self.pointer(at: index) else { return nil }
        return Unmanaged<AnyObject>.fromOpaque(pointer).takeUnretainedValue()
    }

    func removeObject(at index: Int) {
        guard index < count else { return }

        removePointer(at: index)
    }

    func remove(_ object: AnyObject) {
        // get pointer to the passed in object
        let objPtr = Unmanaged.passUnretained(object).toOpaque()
        var objIndex = -1
        for i in 0..<count {
            let ptr = pointer(at: i)

            if ptr == objPtr {
                // pointers equal, found our object!
                objIndex = i
                break
            }
        }

        // make sure index is non-nil and not outside bounds
        if objIndex >= 0 && objIndex < count {
            removePointer(at: objIndex)
        }
    }
}
