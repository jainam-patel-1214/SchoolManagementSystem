export const ObjValueChangeHandler = (e,setter,type) => {
    const { name, value } = e.target
    if (type==='string') {
        setter(prevdata => ({
            ...prevdata,
            [name]: value
        }))
    } else {
        setter(prevdata => ({
            ...prevdata,
            [name]: Number(value)
        }))    
    }
    }
export const ResetState = (obj,setter) => {
        const nullifiedUserData = Object.keys(obj).reduce((acc, key) => {
            acc[key] = null;
            return acc;
        }, {});

        setter(nullifiedUserData);
    };
export const NullStateObjGenerator =(keys)=>{
    const obj = {}
    if (keys.length>0) {
        keys.forEach(e => {
            obj[e] = null
        });
    }
    return obj
}