const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const test = async()=>{
 const hash = await bcrypt.hash(myPlaintextPassword, saltRounds);
 const result = await checkPassword(hash)
 console.log(result);
};
const checkPassword = async (hash)=>{
return await bcrypt.compareSync(myPlaintextPassword, hash); 
}
test();