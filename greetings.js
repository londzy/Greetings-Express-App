module.exports = function Greetings (pool) {

    async function all(){let results = await pool.query('select * from greetz ');
        return results.rows;}

    async function greetingName (language, name) {
        
        if(!language === undefined){
            return "Please select a language";
        }
        if (name === undefined){
            return "Please enter name";
        }
        

        name = name.toLowerCase();
        
        let found = await pool.query('SELECT * from greetz WHERE greeted_names=$1', [name]);
        if (found.rowCount === 0) {
            await pool.query(
                'INSERT INTO greetz (greeted_names,spotted_greetings)values($1, $2)', [name, 0]);
        }
        await pool.query('UPDATE greetz SET spotted_greetings = spotted_greetings + 1 WHERE greeted_names=$1', [name.toLowerCase()]);
    
        if (language === 'English') {
            return 'Hello, ' + name;
        }
        if (language === 'Chinese') {
            return 'Ni hao, ' + name;
        }
        if (language === 'Venda') {
            return 'Ndaa, ' + name;
        }
    }

    async function greetCounter () {
        let count = await pool.query('select count(*) from greetz');
        console.log(count.rows[0].count);
        return count.rows[0].count;
    }

    async function singleName (name){
      name = name.toLowerCase();  
      let result = await pool.query('select * from greetz where greeted_names=$1',[name]) ;
      
      console.log('----------------');
      console.log(result.rows);
      return result.rows[0];
      
    }

    async function resetBtn () {
        await pool.query('delete from greetz');
    }

    return {
        all,
        greetingName,
        greetCounter,
        resetBtn,
        singleName
    };
};
