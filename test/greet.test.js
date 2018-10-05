const assert = require('assert');
const greetings = require('../greetings');
const pg = require('pg');
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/greetings';

const pool = new Pool({
    connectionString
});

describe('The basic database web app', function () {
    beforeEach(async function () {
        await pool.query('delete from greetz');
    });
    it('should greet Ayanda in English', async function () {
        let greet = greetings(pool);
        let greetz = await greet.greetingName('English', 'ayanda');
        assert.equal(greetz, 'Hello, ayanda');
    });

    it('should greet londiwe in Chinese', async function () {
        let greet = greetings(pool);
        let greetz = await greet.greetingName('Chinese', 'londiwe');

        assert.equal(greetz, 'Ni hao, londiwe');
    });

    it('should greet Mthobisi in Venda', async function () {
        let greet = greetings(pool);
        let greetz = await greet.greetingName('Venda', 'Mthobisi');

        assert.equal(greetz, 'Ndaa, mthobisi');
    });

    it('should greet count 2 names greeted', async function() {
     let greet = greetings(pool);
      await greet.greetingName('English', 'Sibusiso');
       await greet.greetingName('Venda', 'Tholinhlanhla');
        assert.equal(2, await greet.greetCounter());
      });

      it('should greet count 3 names greeted', async function() {
        let greet = greetings(pool);
        await greet.greetingName('English', 'Sibusiso');
        await greet.greetingName('Venda', 'Tholinhlanhla');
        await greet.greetingName('Chinese', 'luthuli');
        assert.equal(3, await greet.greetCounter());
         });

        it('should count 1 times same name', async function() {
        let greet = greetings(pool);
        await greet.greetingName('English', 'Sibusiso');
        await greet.greetingName('Venda', 'Sibusiso');
        await greet.greetingName('Chinese', 'luthuli');
            assert.equal(2, await greet.greetCounter());
             });
       
       it('should return en error prompt massage to enter a name', async function () {
    let greet = greetings(pool);
    let greetz = await greet.greetingName('');
        
    assert.equal(greetz, 'Please enter name');
            });

    it('should return return en error prompt massage to select a language', async function () {
    let greet = greetings(pool);
    let greetz = await greet.greetingName('');
    assert.equal(greetz, 'Please enter name');
         });
    
    it('should return all names on the database', async function () {
    let greet = greetings(pool);
    await greet.greetingName('English', 'Sibusiso');
    await greet.greetingName('Venda', 'Sibusiso');
    await greet.greetingName('Chinese', 'luthuli');
    let results = await greet.all();
    console.log(results);
    //assert.equal(await greet.all());
    });
       
    after(function () {
        pool.end();
    });
});
