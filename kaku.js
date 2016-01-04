const PULSE_DIV	        =       34;
const PULSE_MULTIPLIER   =      3;
const MIN_PULSE_LENGTH  =       310;
const MAX_PULSE_LENGTH	=       405;
const AVG_PULSE_LENGTH	=       335;
const RAW_LENGTH		=		50;

var raw = [];

module.exports.createCode = function(){
		clearCode();
		createUnit(1);
		createId(1);
		createState(1);
		createFooter();

		//arctech_switch_old->rawlen = RAW_LENGTH;

		return raw;
}

function createUnit(unit){
    var binary = [];
    var length = 0;

    length = decToBinRev(unit, binary);
    for(var i = 0; i <= length; i++){
        if(binary[i]==1){
            x=i*4;
            createLow(x, x+3);
        }
    }
}

function createId(id){
    var binary = [];
    var length = 0;

    length = decToBinRev(id, binary);
    for(var i=0; i<=length; i++){
        if(binary[i]==1){
            x=i*4;
            createLow(16+x, 16+x+3);
        }
    }
}

function createState(state){
    if(state == 0){
        createHigh(44,47);
    }
}

function createFooter(){
    raw[48] = AVG_PULSE_LENGTH;
    raw[49] = (PULSE_DIV*AVG_PULSE_LENGTH);
}

function createLow(s, e){
    for(var i = s; i<=e; i+=4){
        raw[i]=AVG_PULSE_LENGTH;
        raw[i+1]=(PULSE_MULTIPLIER*AVG_PULSE_LENGTH);
        raw[i+2]=(PULSE_MULTIPLIER*AVG_PULSE_LENGTH);
        raw[i+3]=(AVG_PULSE_LENGTH);
    }
}

function createHigh(s,e){
    for(var i = s; i<=e; i+=4){
        raw[i]=AVG_PULSE_LENGTH;
        raw[i+1]=(PULSE_MULTIPLIER*AVG_PULSE_LENGTH);
        raw[i+2]=(AVG_PULSE_LENGTH);
        raw[i+3]=(PULSE_MULTIPLIER*AVG_PULSE_LENGTH);
    }
}

function clearCode(){
    createHigh(0,35);
    createLow(36,47);
}

function binToDecRev(binary, s, e) {
    var dec = 0;
	//int dec = 0, i = 0;
	var x = 1;
	for(var i=s;i<=e;i++) {
		x*=2;
	}
	for(var i=s;i<=e;i++) {
		x/=2;
		if(binary[i] == 1)
			dec += x;
	}
	return dec;
}

function decToBinRev(n, binary) {
	var i=1;
	var x=0;
	//var y=0;

	while(i<=n) {
		i*=2;
		x++;
	}
	i/=2;
	x--;
	for(var y = x; y >= 0; y--) {
		if((n-i)>=0) {
			n-=i;
			binary[y]=1;
		} else {
			binary[y]=0;
		}
		i/=2;
	}
	return x;
}